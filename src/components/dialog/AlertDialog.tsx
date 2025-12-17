import { BaseDialog } from "@/components/dialog/BaseDialog";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";

interface IProps {
  cancelText?: string;
  confirmText?: string;
  message?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  showConfirm?: boolean;
  title: string;
  trigger: React.ReactNode;
}

export const AlertDialog = ({
  cancelText = "취소",
  confirmText = "확인",
  message,
  onCancel,
  onConfirm,
  showCancel = true,
  showConfirm = true,
  title,
  trigger,
}: IProps) => {
  return (
    <BaseDialog
      className="gap-5"
      footer={
        <div className="flex gap-2">
          {showCancel && (
            <DialogClose asChild>
              <Button onClick={onCancel} variant="outline">
                {cancelText}
              </Button>
            </DialogClose>
          )}
          {showConfirm && (
            <DialogClose asChild>
              <Button onClick={onConfirm}>{confirmText}</Button>
            </DialogClose>
          )}
        </div>
      }
      header={<DialogTitle className="text-neutral720 text-xl font-semibold">{title}</DialogTitle>}
      trigger={trigger}
    >
      {message && <p>{message}</p>}
    </BaseDialog>
  );
};
