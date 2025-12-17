import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-[4px] transition-[color,box-shadow,filter,opacity,background-color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:border",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "px-4 py-2 has-[>svg]:px-3 text-sm font-medium",
        sm: "p-1 gap-1",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground text-center leading-normal hover:brightness-90 disabled:bg-neutral160 disabled:text-neutral400",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "bg-background text-foreground hover:brightness-95",
        link: "text-primary underline-offset-4 hover:underline",
        monoOutline: "bg-background text-foreground border border-foreground hover:bg-background/6",
        outline: "border border-primary text-primary bg-background hover:bg-primary/6",
        s: "px-1.5 py-0.5 bg-white border border-neutral160 text-neutral560 focus-visible:border-neutral160 data-[state=open]:border-neutral160 hover:bg-neutral080",
        secondary: "bg-neutral040 text-neutral480 hover:brightness-95",
      },
    },
  },
);

function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
