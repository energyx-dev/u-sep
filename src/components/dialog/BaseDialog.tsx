import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IProps {
  children?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  trigger?: React.ReactNode;
}

export const BaseDialog = ({ children, className, footer, header, trigger }: IProps) => {
  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        aria-describedby={undefined}
        className={className ?? "max-w-lg"}
        isClose={false}
      >
        {header && <DialogHeader>{header}</DialogHeader>}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
