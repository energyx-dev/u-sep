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
import {
  SupplySystemAddTableList,
  TAnySupplySystemRow,
  TSupplySystemView,
} from "@/domain/shape-info/components/zone/SupplySystemAddTableList";

interface IProps {
  data: TSupplySystemView[];
  dialogTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onGoToPage: () => void;
  onSelect: (system: TAnySupplySystemRow) => void;
  selectedData?: null | TAnySupplySystemRow;
}

export const SupplyManageDialog = ({
  data,
  dialogTitle,
  isOpen,
  onClose,
  onGoToPage,
  onSelect,
  selectedData,
}: IProps) => {
  const [selectedSupplySystem, setSelectedSupplySystem] = useState<null | TAnySupplySystemRow>(
    selectedData ?? null,
  );

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
            <NavigationButton onClick={onGoToPage}>공급 설비 페이지</NavigationButton>
          </div>
          <Button onClick={() => setSelectedSupplySystem(null)} variant="secondary">
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="max-h-[278px] overflow-auto">
          <SupplySystemAddTableList
            selectedSupplySystem={selectedSupplySystem ?? ({} as TAnySupplySystemRow)}
            setSelectedSupplySystem={setSelectedSupplySystem}
            supplySystems={data}
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
              onSelect(selectedSupplySystem ?? ({} as TAnySupplySystemRow));
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
