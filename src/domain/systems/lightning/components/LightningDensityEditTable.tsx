import { useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { LIGHTNING_DENSITY_COLUMNS } from "@/domain/systems/lightning/constants/lightning-density.column";
import { lightningDensityErrorMap } from "@/domain/systems/lightning/schemas/lightning-density.error-map";
import {
  lightningDensityGuiSchema,
  TLightningDensityGuiSchema,
} from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { useLightningDensityStore } from "@/domain/systems/lightning/stores/lightning-density.store";
import { checkLightningDensityMapping } from "@/domain/systems/utils/check-mapped-data";
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

export const LightningDensityEditTable = ({ handleChangeMode, isEdit, mode }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { addLightningDensity, syncLightningDensity } = useDataSyncActions();
  const { openNewConfirmDialog } = useNewConfirmDialog();

  const { density } = useLightningDensityStore(useShallow((state) => ({ density: state.density })));

  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: density,
    schema: lightningDensityGuiSchema.omit({ id: true }),
    setErrorMap: lightningDensityErrorMap,
    //
    addAction: (data) => {
      addLightningDensity(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("조명"));
    },
    syncAction: (data) => {
      syncLightningDensity(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.update("조명"));
    },
  });

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems.filter((item) => item.id).map((item) => item.id!);
      if (deletedIds.length === 0) return true;

      const beforeFloors = useBeforeBuildingGeometryStore.getState().buildingFloors;
      const afterFloors = useAfterBuildingGeometryStore.getState().buildingFloors;
      const { affectedZones, deletedDensities } = checkLightningDensityMapping(
        deletedIds,
        beforeFloors,
        afterFloors,
      );

      if (affectedZones.length === 0) return true;
      const deletedDensityNames = deletedDensities
        .map((density: TLightningDensityGuiSchema) => density.name)
        .join(", ");

      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedDensityNames}이(가) 선택된 존이 있어 삭제할 수 없습니다. 존에서 먼저 선택 해제해주세요.`,
        title: "조명 삭제 불가",
      });

      return !confirm;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(density);
    syncLightningDensity(density);
  };

  return (
    <div>
      <TableSection.Header title="조명 밀도">
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
        columns={LIGHTNING_DENSITY_COLUMNS}
        data={systemList}
        errors={validationErrors}
        key={systemList.length}
        label="조명"
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        placementSystem={"density"}
        setData={setSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </div>
  );
};
