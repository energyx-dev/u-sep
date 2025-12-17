import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 삼상 체크박스 컴포넌트
 * - 'checked', 'indeterminate', 'unchecked' 3가지 상태 지원
 *
 * 사용 예시:
 * <ThreeStateCheckbox value={value} onChange={setValue} />
 */
export type TThreeStateCheckboxValue = "checked" | "indeterminate" | "unchecked";

type TProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checkIconClassName?: string;
  onChange: () => void;
  value: TThreeStateCheckboxValue;
};

export function ThreeStateCheckbox({
  checkIconClassName,
  className,
  disabled,
  onChange,
  value,
  ...props
}: TProps) {
  // radix 체크박스의 checked/indeterminate 상태 매핑
  const radixChecked = value === "checked";
  const radixIndeterminate = value === "indeterminate";

  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 cursor-pointer rounded-[2px] border shadow-xs transition-[background,border,shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        radixChecked && "bg-primary border-primary text-primary-foreground",
        radixIndeterminate && "border-primary text-primary",
        className,
      )}
      data-slot="checkbox"
      disabled={disabled}
      onCheckedChange={onChange}
      {...props}
    >
      <span
        className="flex items-center justify-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        {radixIndeterminate ? (
          <MinusIcon className={cn("size-3.5", checkIconClassName)} />
        ) : radixChecked ? (
          <CheckIcon className={cn("size-3.5", checkIconClassName)} />
        ) : null}
      </span>
    </CheckboxPrimitive.Root>
  );
}
