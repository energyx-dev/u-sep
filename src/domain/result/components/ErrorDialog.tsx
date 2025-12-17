import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorDialog = ({ isOpen, onClose }: IProps) => {
  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent
        className="w-[412px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">에러 발생</DialogTitle>
        </DialogHeader>
        <p className="text-bk7 text-sm">에러가 발생했습니다. 다시 시도해 주세요.</p>
        <div className="text-right">
          <Button onClick={onClose}>확인</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
