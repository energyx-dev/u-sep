import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef } from "react";

import { TGroupSelectOption, TSelectOption } from "@/components/custom/select/select.types";
import { stringToValue, valueToString } from "@/components/custom/select/select.utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface IGroupSelectUIProps<T = string> {
  disabled?: boolean;
  groupedOptions: (TGroupSelectOption<T> | TSelectOption<T>)[];
  onValueChange: (value: T) => void;
  placeholder?: string;
  selectItemProps?: Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "value">;
  triggerClassName?: string;
  value: T;
}

const GroupSelectUI = <T,>(
  props: IGroupSelectUIProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  const {
    disabled = false,
    groupedOptions,
    onValueChange,
    placeholder,
    selectItemProps,
    triggerClassName,
    value,
  } = props;

  const itemClassName = "bg-background text-bk11 cursor-pointer text-sm hover:brightness-95";

  const handleValueChange = (value: string) => {
    if (onValueChange) {
      onValueChange(stringToValue(value));
    }
  };

  return (
    <Select
      onValueChange={handleValueChange}
      value={value !== undefined ? valueToString(value) : undefined}
    >
      <SelectTrigger
        className={cn(
          "h-auto w-full border-none p-2 shadow-none focus-visible:border-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
        disabled={disabled}
        iconClassName="size-3 opacity-100"
        ref={ref}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groupedOptions.map((group) => {
          if ("options" in group) {
            return (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-bk6 text-sm">{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem
                    className={itemClassName}
                    key={valueToString(option.value)}
                    value={valueToString(option.value)}
                    {...selectItemProps}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          } else {
            return (
              <SelectItem
                className={itemClassName}
                key={valueToString(group.value)}
                value={valueToString(group.value)}
                {...selectItemProps}
              >
                {group.label}
              </SelectItem>
            );
          }
        })}
      </SelectContent>
    </Select>
  );
};

export default forwardRef(GroupSelectUI) as <T = string>(
  props: IGroupSelectUIProps<T> & { ref?: React.ForwardedRef<HTMLButtonElement> },
) => React.ReactElement;
