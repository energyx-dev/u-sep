import { ChevronDownIcon } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface IPopoverOption {
  label: ReactNode | string;
  onClick?: (value: string) => void;
  value: string;
}

interface IProps {
  buttonClassName?: string;
  contentClassName?: string;
  options: IPopoverOption[];
  portal?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerNode?: ReactNode;
}

export const PopoverUI = ({
  buttonClassName,
  contentClassName,
  options,
  portal,
  triggerClassName,
  triggerLabel,
  triggerNode,
}: IProps) => {
  return (
    <Popover modal={portal}>
      <PopoverTrigger
        className={cn("bg-bk3 text-bk8 flex cursor-pointer gap-2 rounded-sm p-2", triggerClassName)}
      >
        {triggerNode || (
          <>
            <p className="text-xs font-medium">{triggerLabel}</p>
            <ChevronDownIcon className="h-4 w-4" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "flex w-fit min-w-[128px] flex-col gap-1 rounded-sm border-none p-1",
          contentClassName,
        )}
      >
        {options.map(({ label, onClick, value }) => (
          <PopoverClose asChild key={value}>
            <Button
              className={cn(
                "justify-start px-2 text-sm font-normal focus-visible:ring-0",
                buttonClassName,
              )}
              key={value}
              onClick={() => onClick?.(value)}
              variant="ghost"
            >
              {label}
            </Button>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
};
