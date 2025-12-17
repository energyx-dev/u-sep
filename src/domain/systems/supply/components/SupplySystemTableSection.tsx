import { useOverlay } from "@toss/use-overlay";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { getSourceSystemTypesBySupplySystem } from "@/domain/systems/helpers/helper.utils";
import { AddSourceSystemDialog } from "@/domain/systems/source/components/AddSourceSystemDialog";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { SUPPLY_SYSTEM_LABEL } from "@/domain/systems/supply/constants/supply-system.constants";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useEditSupplySystem } from "@/domain/systems/supply/hooks/useEditSupplySystem";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { checkSupplySystemMapping } from "@/domain/systems/utils/check-mapped-data";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";
import { isAllArraysEmpty } from "@/lib/utils";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export type AnySupplyRow = TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema][number];

export type AnySupplyRowWithCommonFields = AnySupplyRow & {
  id: string;
  name: string;
  purpose: EPurpose | null;
};

interface IProps<T extends ESupplySystemType = ESupplySystemType> {
  supplySystem: TSupplySystemGuiSchema[T];
  supplySystemType: T;
}

export const SupplySystemTableSection = ({ supplySystem, supplySystemType }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { handleChangeMode, isEdit, mode } = useTableSectionViewMode();
  const { openNewConfirmDialog } = useNewConfirmDialog();
  const { columns, handleSubmit, setSystemList, systemList, validationErrors } =
    useEditSupplySystem({
      mode: "edit",
      savedSystemList: supplySystem,
      supplySystemType,
    });

  // 생산 설비 전역 데이터
  const sourceSystemState = useSourceSystemStore(
    useShallow((state) => ({
      [ESourceSystemType.ABSORPTION_CHILLER]: state.absorption_chiller,
      [ESourceSystemType.BOILER]: state.boiler,
      [ESourceSystemType.CHILLER]: state.chiller,
      [ESourceSystemType.DISTRICT_HEATING]: state.district_heating,
      [ESourceSystemType.GEOTHERMAL_HEATPUMP]: state.geothermal_heatpump,
      [ESourceSystemType.HEATPUMP]: state.heatpump,
    })),
  );

  const isEmptySourceSystem = isAllArraysEmpty(sourceSystemState);

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems
        .filter((item) => (item as { id: string }).id)
        .map((item) => (item as { id: string }).id!);

      if (deletedIds.length === 0) return true;

      const beforeFloors = useBeforeBuildingGeometryStore.getState().buildingFloors;
      const afterFloors = useAfterBuildingGeometryStore.getState().buildingFloors;
      const { affectedZones, deletedSupplySystem } = checkSupplySystemMapping(
        deletedIds,
        beforeFloors,
        afterFloors,
        systemList as Partial<AnySupplyRow>[],
      );

      if (affectedZones.length === 0) return true;
      const deletedSupplySystemNames = deletedSupplySystem
        .map((supplySystem: Partial<AnySupplyRow>) => supplySystem.name)
        .join(", ");
      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedSupplySystemNames}이(가) 선택된 존이 있어 삭제할 수 없습니다. 존에서 먼저 선택 해제해주세요.`,
        title: "공급 설비 삭제 불가",
      });

      return !confirm;
    },
    setData: setSystemList,
  });
  const { handleDeleteRow, handleSupplyAddRow, resetCheckedRows } = actionEditTable;

  const overlay = useOverlay();

  const openDialog = useCallback(
    ({
      columnId,
      row,
      rowIndex,
    }: {
      columnId: string;
      row: Partial<AnySupplyRow>;
      rowIndex: number;
    }) => {
      if (isEmptySourceSystem) {
        toast.error("등록된 생산 설비가 없습니다.");
        return;
      }
      const allowedSourceTypes = getSourceSystemTypesBySupplySystem(supplySystemType, row.purpose!);
      const hasMatchingSourceSystem = allowedSourceTypes.some((type) => {
        const systems = sourceSystemState[type];
        return systems && systems.length > 0;
      });

      if (!hasMatchingSourceSystem) {
        toast.error(
          `공급설비와 매칭되는 생산설비가 존재하지 않습니다.\n\n생산 설비를 먼저 등록해주세요.`,
        );
        return;
      }

      overlay.open(({ close, isOpen }) => (
        <AddSourceSystemDialog
          dialogTitle="생산 설비"
          isOpen={isOpen}
          onClose={close}
          onSelect={(system) => {
            if (columnId !== "source_system_id") return;
            const next = (systemList as Partial<AnySupplyRow>[]).map((r, idx) => {
              return idx === rowIndex
                ? ({ ...r, source_system_id: system.id } as Partial<AnySupplyRow>)
                : r;
            });
            setSystemList(next as typeof systemList);
            close();
          }}
          purpose={row.purpose!}
          row={row}
          sourceSystemState={sourceSystemState}
          systemType={supplySystemType}
        />
      ));
    },
    [overlay, setSystemList, systemList, supplySystemType, sourceSystemState, supplySystem],
  );

  const LABEL = SUPPLY_SYSTEM_LABEL[supplySystemType];

  const handleCancel = () => {
    setSystemList(supplySystem);
    resetCheckedRows();
    handleChangeMode("view");
  };

  const onSubmit = () => {
    if (validationErrors.length > 0) return;
    handleSubmit();
    resetCheckedRows();
    handleChangeMode("view");
  };

  return (
    <>
      <TableSection.Header title={LABEL}>
        {isEdit ? (
          <TableSection.ActionButtons
            onCancel={handleCancel}
            onDelete={handleDeleteRow}
            onSubmit={() => {
              clearRef.current();
              onSubmit();
            }}
          />
        ) : (
          <Button
            className="border-neutral-200 p-1 text-neutral-600"
            onClick={() => {
              handleChangeMode("edit");
            }}
            variant="monoOutline"
          >
            관리
          </Button>
        )}
      </TableSection.Header>
      <NewEditTable
        actionEditTable={actionEditTable}
        addRow={() => handleSupplyAddRow(supplySystemType)}
        columns={columns}
        data={systemList}
        errors={validationErrors}
        key={systemList.length}
        label={LABEL}
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        openDialog={openDialog}
        placementSystem={"supplySystem"}
        setData={setSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </>
  );
};
