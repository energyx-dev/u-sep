import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IProps {
  confirmOptions: {
    closeText: string;
    description: string;
    firstActionText: string;
    onClose: () => void;
    onFirstAction: () => void;
    onSecondAction?: () => void;
    secondActionText?: string;
    title: string;
  };
  dialogType:
    | "confirm-empty"
    | "confirm-only-density"
    | "confirm-only-lightning"
    | "confirm-select"
    | "density"
    | "lightning"
    | null;
  setConfirmOptions: React.Dispatch<
    React.SetStateAction<null | {
      closeText: string;
      description: string;
      firstActionText: string;
      onClose: () => void;
      onFirstAction: () => void;
      onSecondAction?: () => void;
      secondActionText?: string;
      title: string;
    }>
  >;
}

export const LightningConfirmDialog = ({
  confirmOptions,
  dialogType,
  setConfirmOptions,
}: IProps) => {
  return (
    <AlertDialog
      open={
        dialogType === "confirm-empty" ||
        dialogType === "confirm-select" ||
        dialogType === "confirm-only-lightning" ||
        dialogType === "confirm-only-density"
      }
    >
      <AlertDialogContent>
        <AlertDialogTitle>{confirmOptions.title}</AlertDialogTitle>
        <AlertDialogDescription>{confirmOptions.description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              confirmOptions.onClose?.();
              setConfirmOptions(null);
            }}
          >
            {confirmOptions.closeText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmOptions.onFirstAction?.();
              setConfirmOptions(null);
            }}
            variant={
              dialogType === "confirm-only-lightning" || dialogType === "confirm-only-density"
                ? "outline"
                : "default"
            }
          >
            {confirmOptions.firstActionText}
          </AlertDialogAction>
          {confirmOptions.secondActionText && confirmOptions.onSecondAction && (
            <AlertDialogAction
              onClick={() => {
                confirmOptions.onSecondAction?.();
                setConfirmOptions(null);
              }}
            >
              {confirmOptions.secondActionText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
