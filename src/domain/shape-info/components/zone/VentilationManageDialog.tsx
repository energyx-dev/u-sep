import { useState } from "react";
import { toast } from "sonner";

import { NavigationButton } from "@/components/custom/buttons/NavigationButton";
import { ViewAndSelectTable } from "@/components/table/ViewAndSelectTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VENTILATION_SYSTEM_COLUMNS } from "@/domain/systems/ventilation/constants/ventilation.column";
import { TVentilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";

interface IProps {
  data: TVentilationEngineAndGuiSchema[];
  dialogTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onGoToPage: () => void;
  onSelect: (system: TVentilationEngineAndGuiSchema) => void;
  selectedData: TVentilationEngineAndGuiSchema;
}

export const VentilationManageDialog = ({
  data,
  dialogTitle,
  isOpen,
  onClose,
  onGoToPage,
  onSelect,
  selectedData,
}: IProps) => {
  const [selectedVentilationSystem, setSelectedVentilationSystem] =
    useState<TVentilationEngineAndGuiSchema>(selectedData as TVentilationEngineAndGuiSchema);

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
            <NavigationButton onClick={onGoToPage}>환기 설비 페이지</NavigationButton>
          </div>
          <Button
            onClick={() => setSelectedVentilationSystem({} as TVentilationEngineAndGuiSchema)}
            variant="secondary"
          >
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="max-h-[278px] overflow-auto">
          <ViewAndSelectTable
            columns={VENTILATION_SYSTEM_COLUMNS}
            data={data}
            onSelectRow={(row) => setSelectedVentilationSystem(row)}
            selectedRowId={selectedVentilationSystem.id}
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
            disabled={!selectedVentilationSystem}
            onClick={() => {
              if (!selectedVentilationSystem) {
                toast("를 선택해주세요.");
                return;
              }
              onSelect(selectedVentilationSystem);
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
