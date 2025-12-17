import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef } from "react";

import { TSelectOption } from "@/components/custom/select/select.types";
import { stringToValue, valueToString } from "@/components/custom/select/select.utils";
import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface IProps<T = string> {
  disabled?: boolean;
  hasBorder?: boolean;
  hasFormControl?: boolean;
  onValueChange: (value: T) => void;
  options: TSelectOption<T>[];
  placeholder?: string;
  selectItemProps?: Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "value">;
  triggerClassName?: string;
  value?: T;
}

// hasFormControl 옵션 사용 시, 무한 루프 에러 있음 밖으로 빼고 걷어내기
const SelectUI = <T,>(props: IProps<T>, ref: React.ForwardedRef<HTMLButtonElement>) => {
  const {
    disabled = false,
    hasBorder = true,
    hasFormControl = false,
    onValueChange,
    options,
    placeholder,
    selectItemProps,
    triggerClassName,
    value,
  } = props;

  const handleValueChange = (value: string) => {
    if (onValueChange) {
      onValueChange(stringToValue(value));
    }
  };

  const selectTrigger = (
    <SelectTrigger
      className={cn(
        "disabled:bg-bk3 h-auto w-full p-2",
        !hasBorder && "border-none shadow-none focus-visible:border-none focus-visible:ring-0",
        triggerClassName,
      )}
      disabled={disabled}
      iconClassName="size-5 opacity-100"
      ref={ref}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  );

  return (
    <Select
      onValueChange={handleValueChange}
      value={value !== undefined ? valueToString(value) : undefined}
    >
      {hasFormControl ? <FormControl>{selectTrigger}</FormControl> : selectTrigger}
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={valueToString(option.value)}
            value={valueToString(option.value)}
            {...selectItemProps}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default forwardRef(SelectUI) as <T = string>(
  props: IProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> },
) => React.ReactElement;
