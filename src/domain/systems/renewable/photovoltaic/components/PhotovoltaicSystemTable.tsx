import Decimal from "decimal.js";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { PHOTOVOLTAIC_SYSTEM_COLUMNS } from "@/domain/systems/renewable/photovoltaic/constants/photovoltaic.column";
import { photovoltaicErrorMap } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.error-map";
import {
  photovoltaicAddSchema,
  TPhotovoltaicSystemEngineAndGuiSchema,
} from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { checkPhotovoltaicSystemMapping } from "@/domain/systems/utils/check-mapped-data";
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

export const PhotovoltaicSystemTable = ({ handleChangeMode, isEdit, mode }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { addPhotovoltaicSystemRenewable, syncPhotovoltaicSystemRenewable } = useDataSyncActions();
  const { openNewConfirmDialog } = useNewConfirmDialog();
  const { photovoltaicSystems } = useRenewableStore(
    useShallow((state) => ({ photovoltaicSystems: state.photovoltaic_systems })),
  );
  const photovoltaicSystemsWithScaledEfficiency = useMemo(() => {
    return photovoltaicSystems.map((sys) => ({
      ...sys,
      efficiency: new Decimal(sys.efficiency).times(100).toNumber(),
    }));
  }, [photovoltaicSystems]);

  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: photovoltaicSystemsWithScaledEfficiency,
    schema: photovoltaicAddSchema,
    setErrorMap: photovoltaicErrorMap,
    //
    addAction: (data: TPhotovoltaicSystemEngineAndGuiSchema[]) => {
      const payload = data.map((photovoltaic) => ({
        ...photovoltaic,
        efficiency: new Decimal(photovoltaic.efficiency).div(100).toNumber(),
      }));
      addPhotovoltaicSystemRenewable(payload);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("태양광 발전 설비"));
    },
    syncAction: (data: TPhotovoltaicSystemEngineAndGuiSchema[]) => {
      const payload = data.map((photovoltaic) => ({
        ...photovoltaic,
        efficiency: new Decimal(photovoltaic.efficiency).div(100).toNumber(),
      }));
      syncPhotovoltaicSystemRenewable(payload);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.update("태양광 발전 설비"));
    },
  });

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems.filter((item) => item.id).map((item) => item.id!);

      if (deletedIds.length === 0) return true;

      const beforeRemodel = useBeforeBuildingGeometryStore.getState().photovoltaic_systems;
      const afterRemodel = useAfterBuildingGeometryStore.getState().photovoltaic_systems;

      const { affectedZones, deletedPhotovoltaicSystem } = checkPhotovoltaicSystemMapping(
        deletedIds,
        beforeRemodel,
        afterRemodel,
        photovoltaicSystemsWithScaledEfficiency,
      );
      if (affectedZones.length === 0) return true;
      const deletedPhotovoltaicSystemNames = deletedPhotovoltaicSystem
        .map((photovoltaic: TPhotovoltaicSystemEngineAndGuiSchema) => photovoltaic.name)
        .join(", ");
      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedPhotovoltaicSystemNames}이(가) 선택된 리모델링 버전이 있어 삭제할 수 없습니다. 리모델링 버전에서 먼저 선택 해제해주세요.`,
        title: "신재생 삭제 불가",
      });

      return !confirm;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(photovoltaicSystemsWithScaledEfficiency);
    syncPhotovoltaicSystemRenewable(photovoltaicSystems);
  };

  return (
    <>
      <TableSection.Header title="태양광 발전 설비">
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
        columns={PHOTOVOLTAIC_SYSTEM_COLUMNS}
        data={systemList}
        errors={validationErrors}
        key={systemList.length}
        label="태양광 발전 설비"
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        placementSystem={"photovoltaicSystems"}
        setData={setSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </>
  );
};
