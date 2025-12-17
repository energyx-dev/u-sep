import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { Control } from "react-hook-form";

import { TooltipUI } from "@/components/custom/TooltipUI";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormInputProps<T extends FieldValues> {
  disabled?: boolean;
  error?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  label: string;
  name: Path<T>;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  register: UseFormRegister<T>;
  tooltip?: string;
  type?: string;
}
interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  disabled?: boolean;
  isRequired?: boolean;
  label: string;
  name: Path<T>;
  onValueChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const ShapeInfoEditInput = <T extends FieldValues>({
  disabled = false,
  error,
  isRequired = false,
  label,
  name,
  onBlur,
  placeholder = "입력하세요.",
  register,
  tooltip,
  type = "text",
}: FormInputProps<T>) => {
  return (
    <div className="relative flex w-full flex-col gap-1.5">
      <FormLabel
        className={`text-neutral560 gap-0.5 text-sm ${error && cn("text-destructive")}`}
        htmlFor={name}
      >
        {label}
        {isRequired && <span className="text-destructive text-sm">*</span>}
      </FormLabel>
      <Input
        id={name}
        type={type}
        {...register(name)}
        className={`h-11 ${error && "border-destructive"}`}
        disabled={disabled}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {disabled && tooltip && (
        <div className="absolute top-9 right-3">
          <TooltipUI text={tooltip} />
        </div>
      )}
      {error && <p className="text-2xs text-destructive">{error}</p>}
    </div>
  );
};

export const ShapeInfoEditSelect = <T extends FieldValues>({
  control,
  disabled = false,
  isRequired = false,
  label,
  name,
  onValueChange,
  options,
  placeholder = "선택하세요.",
}: FormSelectProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-1 flex-col gap-1.5">
          <FormLabel htmlFor={name}>
            {label}
            {isRequired && <span className="text-destructive text-sm">*</span>}
          </FormLabel>
          <Select
            disabled={options?.length === 0 || disabled}
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder={placeholder}>
                  {options?.find((opt) => opt.value === field.value)?.label ?? ""}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            {options && (
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
