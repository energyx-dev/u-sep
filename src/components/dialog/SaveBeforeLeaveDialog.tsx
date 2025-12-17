import { toast } from "sonner";

import { useFileManage } from "@/components/custom/gnb/file-manage/useFileManage";
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
  fileName?: string;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
  open: boolean;
  title: string;
}

export const SaveBeforeLeaveDialog = ({
  fileName = "새 파일",
  onOpenChange,
  onSuccess,
  open,
  title,
}: IProps) => {
  const { saveFile } = useFileManage();

  const handleCancelClick = () => {
    onOpenChange(false);
  };

  const handleDiscardClick = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleSaveClick = async () => {
    try {
      const isSaved = await saveFile();
      if (!isSaved) {
        toast.error("저장에 실패했습니다.");
        onOpenChange(false);
      } else {
        toast.success("저장에 성공했습니다.");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);

      const isElectron = import.meta.env.MODE === "electron";
      if (!isElectron) {
        toast.error("저장에 실패했습니다. 웹브라우저에서는 지원하지 않습니다.");
      } else {
        toast.error("저장에 실패했습니다.");
      }
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="w-103">
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription className="break-all">
          "{fileName}"을/를 닫기 전에 변경사항을 저장하시겠습니까? 저장하지 않는 경우 변경 사항은
          손실됩니다.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelClick}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscardClick} variant="outline">
            저장 안 함
          </AlertDialogAction>
          <AlertDialogAction onClick={handleSaveClick}>저장</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
