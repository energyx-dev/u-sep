import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { isNil } from "es-toolkit";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type TFormInputProps<T extends FieldValues> = {
  className?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  form: UseFormReturn<T>;
  isInitUndefined?: boolean;
  isRequired?: boolean;
  label?: string;
  name: Path<T>;
  onBlurCallback?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  value?: string;
};

export const FormInput = <T extends FieldValues>({
  className,
  description,
  disabled = false,
  form,
  isInitUndefined = false,
  isRequired = false,
  label,
  name,
  onBlurCallback,
  placeholder,
  readOnly = false,
  type = "text",
  value = "",
}: TFormInputProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel
              description={description}
              isRequired={isRequired}
              label={label}
              name={name}
            ></FormLabel>
          )}
          <FormControl>
            <Input
              className={className}
              placeholder={placeholder}
              type={type}
              {...field}
              disabled={disabled}
              onBlur={() => {
                field.onBlur();
                if (type === "number") {
                  if (field.value !== "" && field.value !== undefined) {
                    field.onChange(Number(field.value));
                  }
                }
                onBlurCallback?.();
              }}
              onChange={(e) => {
                const value: number | string = e.target.value;

                if (type === "number") {
                  // 숫자와 소수점만 남김 (정규식 수정)
                  let numericString = value.replace(/[^0-9.]/g, "");

                  // 소수점이 두 개 이상 입력되는 것을 방지
                  const parts = numericString.split(".");
                  if (parts.length > 2) {
                    numericString = parts[0] + "." + parts.slice(1).join("");
                  }

                  // 전체 자릿수(정수부 + 소수부) 15자리 제한
                  const numericOnly = numericString.replace(".", "");
                  if (numericOnly.length > 15) {
                    return;
                  }

                  // placeholder를 위해 빈값 허용
                  if (!isInitUndefined && numericString === "") {
                    field.onChange("");
                    return;
                  }

                  // 초기값이 undefined 인 경우 대비
                  // if (isInitUndefined && numericString === "") {
                  //   field.onChange(undefined);
                  //   return;
                  // }

                  field.onChange(numericString);
                  return;
                }

                field.onChange(value);
              }}
              onKeyDown={(e) => {
                if (type === "number") {
                  if (
                    !/[0-9.]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }
              }}
              readOnly={readOnly}
              value={value !== "" ? value : isNil(field.value) ? "" : String(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
