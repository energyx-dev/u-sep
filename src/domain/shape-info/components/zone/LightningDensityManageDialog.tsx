import { useEffect, useState } from "react";

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
import { LIGHTNING_DENSITY_COLUMNS } from "@/domain/systems/lightning/constants/lightning-density.column";
import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";

interface IProps {
  data: TLightningDensityGuiSchema[];
  dialogTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onGoToPage: () => void;
  onSelect: (system?: TLightningDensityGuiSchema) => void;
  selectedData?: TLightningDensityGuiSchema;
}

export const LightningDensityManageDialog = ({
  data,
  dialogTitle,
  isOpen,
  onClose,
  onGoToPage,
  onSelect,
  selectedData,
}: IProps) => {
  const [selectedLightningDensity, setSelectedLightningDensity] = useState<
    TLightningDensityGuiSchema | undefined
  >(selectedData);

  useEffect(() => {
    setSelectedLightningDensity(selectedData);
  }, [selectedData]);

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
            <NavigationButton onClick={onGoToPage}>조명 페이지</NavigationButton>
          </div>
          <Button onClick={() => setSelectedLightningDensity(undefined)} variant="secondary">
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="max-h-[278px] overflow-auto">
          <ViewAndSelectTable
            columns={LIGHTNING_DENSITY_COLUMNS}
            data={data}
            onSelectRow={(row) => setSelectedLightningDensity(row)}
            selectedRowId={selectedLightningDensity?.id || ""}
            type="single-select"
          />
        </div>

        {/* footer */}
        <DialogFooter className="sticky bottom-0 justify-end bg-white">
          <DialogClose asChild>
            <Button
              onClick={() => {
                setSelectedLightningDensity(selectedData);
                onClose();
              }}
              type="button"
              variant="outline"
            >
              취소
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              onSelect(selectedLightningDensity);
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
