import { useOverlay } from "@toss/use-overlay";

import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";

export const useConfirmDialog = () => {
  const overlay = useOverlay();

  const openConfirmDialog = ({
    closeText,
    confirmText,
    description,
    title,
  }: {
    closeText?: string;
    confirmText?: string;
    description?: string;
    title: string;
  }) => {
    return new Promise<boolean>((resolve) => {
      overlay.open(({ close, isOpen }) => (
        <ConfirmDialog
          closeText={closeText}
          confirmText={confirmText}
          description={description}
          onClose={() => {
            resolve(false);
            close();
          }}
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
    openConfirmDialog,
  };
};
