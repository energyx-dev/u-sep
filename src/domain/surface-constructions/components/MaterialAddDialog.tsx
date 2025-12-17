import { useState } from "react";
import { useShallow } from "zustand/shallow";

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
import { MATERIAL_COLUMNS } from "@/domain/material/constants/column";
import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
import { useMaterialStore } from "@/domain/material/stores/material.store";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TViewMode } from "@/types/view-mode.type";

import { TSurfaceConstructionTable } from "../helper/helper.util";

interface IProps {
  columnId: string;
  isOpen: boolean;
  mode: TViewMode;
  onClose: () => void;
  onSelect: (args: {
    columnId: string;
    materialId: string;
    rowIndex: number;
    type: BUILDING_SURFACE_TYPE;
  }) => void;
  row: Partial<TSurfaceConstructionTable>;
  rowIndex: number;
  savedList: TMaterialEngineAndGuiSchema[];
  type: BUILDING_SURFACE_TYPE;
}

export const MaterialAddDialog = ({
  columnId,
  isOpen,
  onClose,
  onSelect,
  row,
  rowIndex,
  type,
}: IProps) => {
  const { materials } = useMaterialStore(
    useShallow((state) => ({
      materials: state.materials,
    })),
  );

  const getInitialMaterialId = () => {
    const value = (row as Record<string, unknown>)[columnId];
    return value ? String(value) : "";
  };
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(getInitialMaterialId());

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex max-h-[90dvh] w-3xl max-w-[90vw] flex-col gap-5 overflow-auto p-0 sm:max-w-[90vw]"
        isClose={false}
      >
        {/* header */}
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-3 bg-white p-8 pb-0">
          <DialogTitle className="text-xl font-semibold">재료</DialogTitle>
          <Button onClick={() => setSelectedMaterialId("")} variant="secondary">
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="flex-1 px-8">
          <ViewAndSelectTable<TMaterialEngineAndGuiSchema>
            columns={MATERIAL_COLUMNS}
            data={materials}
            onSelectRow={(row) => setSelectedMaterialId(row.id)}
            selectedRowId={selectedMaterialId}
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
                onSelect({ columnId, materialId: selectedMaterialId, rowIndex, type });
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
