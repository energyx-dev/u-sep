import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ToolbarButton = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      className={cn(
        "text-neutral560 hover:text-primary hover:bg-background disabled:text-neutral160 gap-1 border-none px-0 py-[3px] leading-none hover:brightness-100 disabled:opacity-100 has-[>svg]:px-0",
        className,
      )}
      variant={"ghost"}
      {...props}
    />
  );
};
