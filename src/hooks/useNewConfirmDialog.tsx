import { useOverlay } from "@toss/use-overlay";

import { NewConfirmDialog } from "@/components/dialog/NewConfirmDialog";

export const useNewConfirmDialog = () => {
  const overlay = useOverlay();

  const openNewConfirmDialog = ({
    confirmText,
    description,
    title,
  }: {
    confirmText?: string;
    description?: string;
    title: string;
  }) => {
    return new Promise<boolean>((resolve) => {
      overlay.open(({ close, isOpen }) => (
        <NewConfirmDialog
          confirmText={confirmText}
          description={description}
          onConfirm={() => {
            resolve(true);
            close();
          }}
          open={isOpen}
          title={title}
        />
      ));
    });
  };

  return {
    openNewConfirmDialog,
  };
};
