import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewOverwriteBaseRemodelingPanel } from "@/domain/building/components/overwrite-dialog/NewOverwriteBaseRemodelingPanel";
import { NewOverwriteTargetRemodelingPanel } from "@/domain/building/components/overwrite-dialog/NewOverwriteTargetRemodelingPanel";
import { DirectionArrow } from "@/domain/building/components/panel-common/DirectionArrow";
import { useNewOverwriteShape } from "@/domain/building/hooks/useNewOverwriteShape";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

export const BuildingDataOverwriteDialog = ({ isOpen, onClose, onNavigate }: IProps) => {
  const {
    baseRemodelingType,
    baseShapeInfo,
    handleChangeBaseRemodelingType,
    handleChangeSelectedShapeItem,
    handleChangeTargetRemodelingType,
    handleSave,
    selectedShapeItem,
    selectedTargetIds,
    setSelectedTargetIds,
    targetShapeInfo,
  } = useNewOverwriteShape();

  const handleApply = () => {
    const { message, status } = handleSave();
    if (status === "success") {
      toast.success(message);
      onClose();
      onNavigate();
    } else {
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-[90vw] flex-col overflow-auto sm:max-w-fit"
        isClose={false}
        onEscapeKeyDown={onClose}
        onInteractOutside={onClose}
      >
        {/* 헤더 영역 */}
        <DialogHeader className="sticky top-0 z-10 bg-white">
          <DialogTitle className="text-xl font-semibold">덮어쓰기</DialogTitle>
          <DialogDescription>기존 형상 정보를 다른 형상 정보에 덮어씌웁니다.</DialogDescription>
        </DialogHeader>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex flex-1 gap-2.5 overflow-auto">
          {/* 기준 패널 */}
          <NewOverwriteBaseRemodelingPanel
            handleChangeBaseRemodelingType={handleChangeBaseRemodelingType}
            handleChangeSelectedShapeItem={handleChangeSelectedShapeItem}
            selectedShapeItem={selectedShapeItem}
            shapeInfo={baseShapeInfo ?? []}
          />

          {/* 중앙 화살표 */}
          <DirectionArrow isActive={selectedTargetIds.size > 0} />

          {/* 대상 패널 */}
          <NewOverwriteTargetRemodelingPanel
            baseRemodelingType={baseRemodelingType!}
            baseShapeId={selectedShapeItem?.id}
            handleChangeTargetRemodelingType={handleChangeTargetRemodelingType}
            selectableShapeType={selectedShapeItem?.type}
            selectedTargetIds={selectedTargetIds}
            setSelectedTargetIds={setSelectedTargetIds}
            shapeInfo={targetShapeInfo ?? []}
          />
        </div>

        {/* 푸터 영역 */}
        <DialogFooter className="sticky bottom-0 flex flex-col gap-2 bg-white">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button onClick={onClose} type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button disabled={selectedTargetIds.size === 0} onClick={handleApply} type="button">
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
