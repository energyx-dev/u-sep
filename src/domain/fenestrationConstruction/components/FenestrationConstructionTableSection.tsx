import { useRef } from "react";
import { toast } from "sonner";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { useFenestrationStore } from "@/domain/fenestration/stores/fenestration.store";
import { FENESTRATION_CONSTRUCTION_COLUMNS } from "@/domain/fenestrationConstruction/constants/fenestrationConstruction.column";
import { fenestrationConstructionErrorMap } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.error-map";
import {
  fenestrationConstructionAddSchema,
  TFenestrationConstructionEngineAndGuiSchema,
} from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableEditValidator } from "@/hooks/useTableEditValidator";
import { SUCCESS_MESSAGES } from "@/lib/message-helper";
import { TViewMode } from "@/types/view-mode.type";

interface IProps {
  fenestration_constructions: TFenestrationConstructionEngineAndGuiSchema[];
  handleChangeMode: (mode: TViewMode) => void;
  isEdit: boolean;
  mode: TViewMode;
}

export const checkFenestrationConstructionUsage = (
  deletedFenestrationConstructionIds: (string | undefined)[],
) => {
  const fenestrationState = useFenestrationStore.getState().fenestrations;
  const usedFenestrationConstructionIds = new Set<string>();
  fenestrationState.forEach((item) => {
    if (deletedFenestrationConstructionIds.includes(item.construction_id)) {
      usedFenestrationConstructionIds.add(item.construction_id);
    }
  });
  return usedFenestrationConstructionIds;
};

export const FenestrationConstructionTableSection = ({
  fenestration_constructions,
  handleChangeMode,
  isEdit,
  mode,
}: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { openNewConfirmDialog } = useNewConfirmDialog();
  const { addFenestrationConstruction, syncFenestrationConstruction } = useDataSyncActions();
  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: fenestration_constructions,
    schema: fenestrationConstructionAddSchema,
    setErrorMap: fenestrationConstructionErrorMap,
    //
    addAction: (data) => {
      addFenestrationConstruction(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("개구부 구조체"));
    },
    syncAction: (data) => {
      syncFenestrationConstruction(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("개구부 구조체"));
    },
  });

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedMaterialIds = deletedItems
        .filter((item) => item.id)
        .map((item) => (item as { id: string }).id);

      if (deletedMaterialIds.length === 0) return true;
      const usedFenestrationConstructionIds =
        checkFenestrationConstructionUsage(deletedMaterialIds);

      if (usedFenestrationConstructionIds.size > 0) {
        const usedFenestrationConstructionNames = fenestration_constructions
          .filter((f) => usedFenestrationConstructionIds.has(f.id))
          .map((f) => f.name)
          .join(", ");
        await openNewConfirmDialog({
          confirmText: "확인",
          description: `${usedFenestrationConstructionNames}이(가) 선택된 개구부가 있어 삭제할 수 없습니다.\n\n개구부에서 먼저 선택 해제 해주세요.`,
          title: "개구부 구조체 삭제 불가",
        });
        return false;
      }
      return true;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(fenestration_constructions);
    syncFenestrationConstruction(fenestration_constructions);
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

      <div className="relative">
        <NewEditTable
          actionEditTable={actionEditTable}
          columns={FENESTRATION_CONSTRUCTION_COLUMNS}
          data={systemList}
          errors={validationErrors}
          key={systemList.length}
          label="개구부 구조체"
          mode={mode}
          onRegisterComplete={(fn) => {
            clearRef.current = fn;
          }}
          setData={setSystemList}
          setMode={handleChangeMode}
          showRequiredIndicator
          snapshotRef={fenestration_constructions}
          wrapperClassName={"p-0"}
        />
      </div>
    </>
  );
};
