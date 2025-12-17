import Decimal from "decimal.js";
import { sortBy } from "es-toolkit";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSourceSystemTypesBySupplySystem } from "@/domain/systems/helpers/helper.utils";
import {
  SourceSystemAddTableList,
  TAnySourceSystemRow,
} from "@/domain/systems/source/components/SourceSystemAddTableList";
import { SOURCE_SYSTEM_LABEL } from "@/domain/systems/source/constants/source-system.constants";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { AnySupplyRow } from "@/domain/systems/supply/components/SupplySystemTableSection";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";

interface IProps {
  dialogTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (system: TAnySourceSystemRow) => void;
  purpose: EPurpose;
  row: Partial<AnySupplyRow>;
  sourceSystemState: TSourceSystemGuiSchema;
  systemType: ESupplySystemType;
}

export const AddSourceSystemDialog = ({
  dialogTitle,
  isOpen,
  onClose,
  onSelect,
  purpose,
  row,
  sourceSystemState,
  systemType,
}: IProps) => {
  const [selectedSourceSystem, setSelectedSourceSystem] = useState<TAnySourceSystemRow>(
    {} as TAnySourceSystemRow,
  );

  // 생산 설비 전역 데이터

  const { arr, sortedSourceSystems } = useMemo(() => {
    const allowedSourceTypes = getSourceSystemTypesBySupplySystem(systemType, purpose);

    // UI 표시용 스케일 변환 (타입별 퍼센트 스케일 적용)
    const scaledSourceSystemState = Object.fromEntries(
      Object.entries(sourceSystemState).map(([key, list]) => {
        const type = key as ESourceSystemType;

        if (type === ESourceSystemType.BOILER) {
          const scaledList = (list as TSourceSystemGuiSchema[ESourceSystemType.BOILER]).map(
            (item) => ({
              ...item,
              efficiency:
                typeof item.efficiency === "number"
                  ? new Decimal(item.efficiency).times(100).toNumber()
                  : item.efficiency,
            }),
          );
          return [key, scaledList];
        }

        if (type === ESourceSystemType.ABSORPTION_CHILLER) {
          const scaledList = (
            list as TSourceSystemGuiSchema[ESourceSystemType.ABSORPTION_CHILLER]
          ).map((item) => ({
            ...item,
            boiler_efficiency:
              typeof item.boiler_efficiency === "number"
                ? new Decimal(item.boiler_efficiency).times(100).toNumber()
                : item.boiler_efficiency,
          }));
          return [key, scaledList];
        }

        return [key, list];
      }),
    );

    const filteredSourceSystems = Object.entries(scaledSourceSystemState).filter(([key]) =>
      allowedSourceTypes.includes(key as ESourceSystemType),
    );

    const arr = Object.values(scaledSourceSystemState).flatMap((d) => d.map((a) => a));

    const sortedSourceSystems = sortBy(
      filteredSourceSystems.map(([key, data]) => {
        const type = key as ESourceSystemType;
        return {
          data,
          label: SOURCE_SYSTEM_LABEL[type],
          type,
        };
      }),
      ["label"],
    );

    return { arr, sortedSourceSystems };
  }, [sourceSystemState, systemType, purpose]);

  useEffect(() => {
    if (!("source_system_id" in row)) {
      setSelectedSourceSystem({} as TAnySourceSystemRow);
      return;
    }

    const found = arr.find((item) => item.id === row.source_system_id);
    setSelectedSourceSystem((found ?? {}) as TAnySourceSystemRow);
  }, [arr, row]);

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
          </div>
          <Button
            onClick={() => setSelectedSourceSystem({} as TAnySourceSystemRow)}
            variant="secondary"
          >
            선택 해제
          </Button>
        </DialogHeader>

        {/* table */}
        <div className="max-h-[278px] overflow-auto">
          <SourceSystemAddTableList
            selectedSourceSystem={selectedSourceSystem}
            setSelectedSourceSystem={setSelectedSourceSystem}
            sourceSystems={sortedSourceSystems}
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
              onSelect(selectedSourceSystem);
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
