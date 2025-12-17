import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  errorMessage?: string;
}

function Input({ className, errorMessage, type, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "file:text-foreground placeholder:text-neutral320 selection:bg-primary selection:text-primary-foreground",
        "rounded-[4px] border p-2.5",
        "disabled:bg-neutral040 disabled:text-neutral240",
        "aria-invalid:border-negative",
        "flex w-full min-w-0",
        "text-neutral640 bg-transparent text-base font-medium transition-[color,border]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed",
        errorMessage && "border-negative",
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
      onWheel={(e) => {
        (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

export { Input };
