import { useRef } from "react";
import { toast } from "sonner";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { MATERIAL_COLUMNS } from "@/domain/material/constants/column";
import { materialErrorMap } from "@/domain/material/schemas/material.error-map";
import {
  materialGuiAddSchema,
  TMaterialEngineAndGuiSchema,
} from "@/domain/material/schemas/material.schema";
import { useSurfaceConstructionStore } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableEditValidator } from "@/hooks/useTableEditValidator";
import { SUCCESS_MESSAGES } from "@/lib/message-helper";
import { TViewMode } from "@/types/view-mode.type";

interface IProps {
  handleChangeMode: (mode: TViewMode) => void;
  isEdit: boolean;
  materials: TMaterialEngineAndGuiSchema[];
  mode: TViewMode;
}

const checkMaterialUsage = (deletedMaterialIds: string[]) => {
  const surfaceConstructionState = useSurfaceConstructionStore.getState().surface_constructions;
  const usedMaterialIds = new Set<string>();
  surfaceConstructionState.forEach((item) => {
    item.layers.forEach((layer) => {
      if (deletedMaterialIds.includes(layer.material_id)) {
        usedMaterialIds.add(layer.material_id);
      }
    });
  });
  return usedMaterialIds;
};

export const MaterialTableSection = ({ handleChangeMode, isEdit, materials, mode }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { openNewConfirmDialog } = useNewConfirmDialog();
  const { addMaterial, syncMaterial } = useDataSyncActions();
  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: materials,
    schema: materialGuiAddSchema,
    setErrorMap: materialErrorMap,
    //
    addAction: (data) => {
      addMaterial(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("재료"));
    },
    syncAction: (data) => {
      syncMaterial(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("재료"));
    },
  });

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems
        .filter((item) => item.id)
        .map((item) => (item as { id: string }).id);

      if (deletedIds.length === 0) return true;
      const usedMaterialIds = checkMaterialUsage(deletedIds);

      if (usedMaterialIds.size > 0) {
        const usedMaterialNames = materials
          .filter((material) => usedMaterialIds.has(material.id))
          .map((material) => material.name)
          .join(", ");
        const confirm = await openNewConfirmDialog({
          confirmText: "확인",
          description: `${usedMaterialNames}이(가) 선택된 면 구조체가 있어 삭제할 수 없습니다.\n\n면 구조체에서 먼저 선택 해제 해주세요.`,
          title: "재료 삭제 불가",
        });
        return !confirm;
      }
      return true;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(materials);
    syncMaterial(materials);
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
        columns={MATERIAL_COLUMNS}
        data={systemList}
        errors={validationErrors}
        key={systemList.length}
        label="재료"
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        setData={setSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </>
  );
};
