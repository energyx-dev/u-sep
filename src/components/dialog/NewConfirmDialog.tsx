import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IProps {
  confirmText?: string;
  description?: string;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

export const NewConfirmDialog = ({
  confirmText = "확인",
  description = "",
  onConfirm,
  open,
  title,
}: IProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="w-103" // width: 412px
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
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
