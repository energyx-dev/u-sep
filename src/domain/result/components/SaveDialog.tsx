import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

import { useFileManage } from "@/components/custom/gnb/file-manage/useFileManage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TResultPrevDialogData } from "@/domain/result/hooks/useAnalysisButton";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  setDialogData: Dispatch<SetStateAction<TResultPrevDialogData>>;
}

export const SaveDialog = ({ isOpen, onClose, setDialogData }: IProps) => {
  const { saveAsFile, saveFile } = useFileManage();

  const handleSave = async () => {
    try {
      const isSaved = await saveFile();
      if (!isSaved) {
        toast.error("저장에 실패했습니다.");
        onClose();
      } else {
        toast.success("저장에 성공했습니다.");
        setDialogData({ status: "ready" });
      }
    } catch (error) {
      console.error(error);

      const isElectron = import.meta.env.MODE === "electron";
      if (!isElectron) {
        toast.error("저장에 실패했습니다. 웹브라우저에서는 지원하지 않습니다.");
      } else {
        toast.error("저장에 실패했습니다.");
      }
      onClose();
    }
  };

  const handleSaveAs = async () => {
    try {
      const isSaved = await saveAsFile();
      if (!isSaved) {
        toast.error("저장에 실패했습니다.");
        onClose();
      } else {
        toast.success("저장에 성공했습니다.");
        setDialogData({ status: "ready" });
      }
    } catch (error) {
      console.error(error);

      const isElectron = import.meta.env.MODE === "electron";
      if (!isElectron) {
        toast.error("저장에 실패했습니다. 웹브라우저에서는 지원하지 않습니다.");
      } else {
        toast.error("저장에 실패했습니다.");
      }
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="w-[412px]">
        <DialogHeader>
          <DialogTitle className="text-neutral720 text-xl font-semibold">저장하기</DialogTitle>
        </DialogHeader>
        <p className="text-neutral560 text-sm">
          분석을 시작하기 전에 현재까지의 작업을 저장해야 합니다. 변경 사항을 저장하시겠습니까?
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
          <Button onClick={handleSaveAs}>다른 이름으로 저장</Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
