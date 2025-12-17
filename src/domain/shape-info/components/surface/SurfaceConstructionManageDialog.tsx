import { useState } from "react";

import { NavigationButton } from "@/components/custom/buttons/NavigationButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SurfaceConstructionViewAndEditTable } from "@/domain/shape-info/components/surface/SurfaceConstructionViewAndSelectTable";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { useSurfaceConstructionColumn } from "@/domain/surface-constructions/hooks/useSurfaceConstructionColumn";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";

interface IProps {
  columnId: string;
  data: TSurfaceConstructionEngineAndGuiSchema[];
  dialogTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onGoToPage: () => void;
  onSelect: (args: {
    columnId: string;
    rowIndex: number;
    surfaceConstructionId: string;
    type: BUILDING_SURFACE_TYPE;
  }) => void;
  rowIndex: number;
  savedList: TSurfaceConstructionEngineAndGuiSchema[];
  selectedId: string;
  type: BUILDING_SURFACE_TYPE;
}

export const SurfaceConstructionManageDialog = ({
  columnId,
  data,
  dialogTitle,
  isOpen,
  onClose,
  onGoToPage,
  onSelect,
  rowIndex,
  selectedId,
  type,
}: IProps) => {
  const { surfaceConstructionsViewColumn } = useSurfaceConstructionColumn({ type });

  const [selectedConstructionId, setSelectedConstructionId] = useState<string>(selectedId);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-[90vw] min-w-auto flex-col gap-5 overflow-auto sm:min-w-[840px]"
        isClose={false}
      >
        {/* header */}
        <DialogHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-semibold">{dialogTitle}</DialogTitle>
            {/* 페이지로 이동 버튼 (선택적) */}
            <NavigationButton onClick={onGoToPage}>면 구조체 페이지</NavigationButton>
          </div>
          <Button onClick={() => setSelectedConstructionId("")} variant="secondary">
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="max-h-[278px] overflow-auto">
          <SurfaceConstructionViewAndEditTable<TSurfaceConstructionEngineAndGuiSchema>
            columns={surfaceConstructionsViewColumn}
            data={data}
            onSelectRow={(row) => setSelectedConstructionId(row.id)}
            selectedRowId={selectedConstructionId}
            type="single-select"
          />
        </div>

        {/* footer */}
        <DialogFooter className="sticky bottom-0 justify-end bg-white">
          <DialogClose asChild>
            <Button onClick={onClose} type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              onSelect({
                columnId,
                rowIndex,
                surfaceConstructionId: selectedConstructionId,
                type,
              });
              onClose();
            }}
            type="button"
          >
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
