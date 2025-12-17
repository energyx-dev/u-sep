import Decimal from "decimal.js";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { checkVentilationMapping } from "@/domain/systems/utils/check-mapped-data";
import { VENTILATION_SYSTEM_COLUMNS } from "@/domain/systems/ventilation/constants/ventilation.column";
import { ventilationSystemErrorMap } from "@/domain/systems/ventilation/schemas/ventilation-system.error-map";
import {
  TVentilationEngineAndGuiSchema,
  ventilationAddSchema,
} from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import { useVentilationSystemStore } from "@/domain/systems/ventilation/stores/ventilation.store";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableEditValidator } from "@/hooks/useTableEditValidator";
import { SUCCESS_MESSAGES } from "@/lib/message-helper";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";
import { TViewMode } from "@/types/view-mode.type";

interface IProps {
  handleChangeMode: (mode: TViewMode) => void;
  isEdit: boolean;
  mode: TViewMode;
}

export const VentilationSystemTable = ({ handleChangeMode, isEdit, mode }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { addVentilationSystem, syncVentilationSystem } = useDataSyncActions();
  const { openNewConfirmDialog } = useNewConfirmDialog();

  const { ventilationSystems } = useVentilationSystemStore(
    useShallow((state) => ({ ventilationSystems: state.ventilation_systems })),
  );

  const ventilationSystemsWithScaledEfficiency = useMemo(() => {
    return ventilationSystems.map((sys) => ({
      ...sys,
      efficiency_cooling: new Decimal(sys.efficiency_cooling).times(100).toNumber(),
      efficiency_heating: new Decimal(sys.efficiency_heating).times(100).toNumber(),
    }));
  }, [ventilationSystems]);

  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: ventilationSystemsWithScaledEfficiency,
    schema: ventilationAddSchema,
    setErrorMap: ventilationSystemErrorMap,
    //
    addAction: (data) => {
      const payload = data.map((item) => ({
        ...item,
        efficiency_cooling: new Decimal(item.efficiency_cooling).div(100).toNumber(),
        efficiency_heating: new Decimal(item.efficiency_heating).div(100).toNumber(),
      }));
      addVentilationSystem(payload);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("환기 설비"));
    },
    syncAction: (data) => {
      const payload = data.map((item) => ({
        ...item,
        efficiency_cooling: new Decimal(item.efficiency_cooling).div(100).toNumber(),
        efficiency_heating: new Decimal(item.efficiency_heating).div(100).toNumber(),
      }));
      syncVentilationSystem(payload);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.update("환기 설비"));
    },
  });
  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems.filter((item) => item.id).map((item) => item.id!);

      if (deletedIds.length === 0) return true;

      const beforeFloors = useBeforeBuildingGeometryStore.getState().buildingFloors;
      const afterFloors = useAfterBuildingGeometryStore.getState().buildingFloors;
      const { affectedZones, deletedVentilationSystem } = checkVentilationMapping(
        deletedIds,
        beforeFloors,
        afterFloors,
        ventilationSystemsWithScaledEfficiency,
      );

      if (affectedZones.length === 0) return true;
      const deletedVentilationSystemNames = deletedVentilationSystem
        .map((ventilation: TVentilationEngineAndGuiSchema) => ventilation.name)
        .join(", ");
      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedVentilationSystemNames}이(가) 선택된 존이 있어 삭제할 수 없습니다. 존에서 먼저 선택 해제해주세요.`,
        title: "환기 설비 삭제 불가",
      });

      return !confirm;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(ventilationSystemsWithScaledEfficiency);
    syncVentilationSystem(ventilationSystems);
  };

  return (
    <>
      <TableSection.Header title="">
        {isEdit ? (
          <TableSection.ActionButtons
            onCancel={handleCancel}
            onDelete={actionEditTable.handleDeleteRow}
            onSubmit={() => {
              clearRef.current();
              handleSubmit();
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
        columns={VENTILATION_SYSTEM_COLUMNS}
        data={systemList}
        errors={validationErrors}
        key={systemList.length}
        label="환기 설비"
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        placementSystem={"ventilationSystem"}
        setData={setSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </>
  );
};
