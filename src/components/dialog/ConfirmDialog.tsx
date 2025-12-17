import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "../ui/button";

interface IProps {
  closeText?: string;
  confirmText?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export const ConfirmDialog = ({
  closeText = "취소",
  confirmText = "확인",
  description = "",
  onClose,
  onConfirm,
  open,
  title,
}: IProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="w-103" // width: 412px
        onEscapeKeyDown={onClose}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button className="border-primary text-primary" onClick={onClose}>
              {closeText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary flex h-10 items-center border-none text-sm font-medium"
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
