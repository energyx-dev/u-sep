import { useState } from "react";

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
import { FENESTRATION_CONSTRUCTION_COLUMNS } from "@/domain/fenestrationConstruction/constants/fenestrationConstruction.column";
import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import { TViewMode } from "@/types/view-mode.type";

interface IProps {
  columnId: string;
  fenestration_constructions: TFenestrationConstructionEngineAndGuiSchema[];
  isOpen: boolean;
  mode: TViewMode;
  onClose: () => void;
  onSelect: (args: {
    columnId: string;
    fenestrationConstructionId: string;
    rowIndex: number;
  }) => void;
  rowIndex: number;
  selectedId: string;
}

export const AddFenestrationConstruction = ({
  columnId,
  fenestration_constructions,
  isOpen,
  onClose,
  onSelect,
  rowIndex,
  selectedId,
}: IProps) => {
  const [selectedFenestrationConstructionsId, setSelectedFenestrationConstructionsId] =
    useState<string>(selectedId);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] w-3xl max-w-[90vw] flex-col gap-5 overflow-auto p-0 sm:max-w-[90vw]"
        isClose={false}
      >
        {/* header */}
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between bg-white p-8 pb-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="shrink-0 text-xl font-semibold">재료</DialogTitle>
            <span className="text-negative text-left text-sm">
              * 문은 불투명 구조체만, 유리문·창문은 투명 구조체만 선택 가능합니다.
            </span>
          </div>
          <Button onClick={() => setSelectedFenestrationConstructionsId("")} variant="secondary">
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="flex-1 px-8">
          <ViewAndSelectTable<TFenestrationConstructionEngineAndGuiSchema>
            columns={FENESTRATION_CONSTRUCTION_COLUMNS}
            data={fenestration_constructions}
            onSelectRow={(row) => setSelectedFenestrationConstructionsId(row.id)}
            selectedRowId={selectedFenestrationConstructionsId}
            type="single-select"
          />
        </div>

        {/* footer */}
        <DialogFooter className="sticky bottom-0 flex flex-col gap-2 bg-white p-8 pt-0">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                className="text-neutral480"
                onClick={onClose}
                type="button"
                variant="secondary"
              >
                취소
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                onSelect({
                  columnId,
                  fenestrationConstructionId: selectedFenestrationConstructionsId,
                  rowIndex,
                });
                onClose();
              }}
              type="button"
            >
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
