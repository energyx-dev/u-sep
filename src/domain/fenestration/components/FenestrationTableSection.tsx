import { useOverlay } from "@toss/use-overlay";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { AddFenestrationConstruction } from "@/domain/fenestration/components/AddFenestrationConstruction";
import { EFenestrationType } from "@/domain/fenestration/constants/fenestration.enum";
import { useFenestrationColumn } from "@/domain/fenestration/hooks/useFenestrationColumn";
import { fenestrationErrorMap } from "@/domain/fenestration/schemas/fenestration.error-map";
import {
  fenestrationAddSchema,
  TFenestrationEngineAndGuiSchema,
} from "@/domain/fenestration/schemas/fenestration.schema";
import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import { useFenestrationConstructionStore } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { checkFenestrationMapping } from "@/domain/systems/utils/check-mapped-data";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableEditValidator } from "@/hooks/useTableEditValidator";
import { SUCCESS_MESSAGES } from "@/lib/message-helper";
import { isAllArraysEmpty } from "@/lib/utils";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";
import { TViewMode } from "@/types/view-mode.type";

interface IProps {
  fenestration_constructions: TFenestrationConstructionEngineAndGuiSchema[];
  fenestrations: TFenestrationEngineAndGuiSchema[];
  handleChangeMode: (mode: TViewMode) => void;
  isEdit: boolean;
  mode: TViewMode;
}

export const FenestrationTableSection = ({
  fenestration_constructions,
  fenestrations,
  handleChangeMode,
  isEdit,
  mode,
}: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { addFenestration, syncFenestration } = useDataSyncActions();
  const { columns } = useFenestrationColumn();
  const { openNewConfirmDialog } = useNewConfirmDialog();
  const fenestrationConstructionState = useFenestrationConstructionStore(
    useShallow((state) => ({ fenestration_constructions: state.fenestration_constructions })),
  );
  const isEmptyFenestrationConstructions = isAllArraysEmpty(fenestrationConstructionState);
  const { handleSubmit, setSystemList, systemList, validationErrors } = useTableEditValidator({
    mode: "edit",
    savedList: fenestrations,
    schema: fenestrationAddSchema,
    setErrorMap: fenestrationErrorMap,
    //
    addAction: (data) => {
      addFenestration(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("개구부"));
    },
    syncAction: (data) => {
      syncFenestration(data);
      handleChangeMode("view");
      setSystemList(data);
      toast.success(SUCCESS_MESSAGES.add("개구부"));
    },
  });

  const actionEditTable = useActionEditTable({
    data: systemList,
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems
        .filter((item) => item.id)
        .map((item) => (item as { id: string }).id);

      if (deletedIds.length === 0) return true;

      const beforeFloors = useBeforeBuildingGeometryStore.getState().buildingFloors;
      const afterFloors = useAfterBuildingGeometryStore.getState().buildingFloors;
      const { affectedZones, deletedFenestration } = checkFenestrationMapping(
        deletedIds,
        beforeFloors,
        afterFloors,
        fenestrations as TFenestrationEngineAndGuiSchema[],
      );

      if (affectedZones.length === 0) return true;
      const deletedFenestrationNames = deletedFenestration
        .map((fenestration: TFenestrationEngineAndGuiSchema) => fenestration.name)
        .join(", ");
      const confirm = await openNewConfirmDialog({
        confirmText: "확인",
        description: `${deletedFenestrationNames}이(가) 선택된 존이 있어 삭제할 수 없습니다. 존에서 먼저 선택 해제해주세요.`,
        title: "개구부 삭제 불가",
      });

      return !confirm;
    },
    setData: setSystemList,
  });

  const handleCancel = () => {
    handleChangeMode("view");
    setSystemList(fenestrations);
    syncFenestration(fenestrations);
  };

  const overlay = useOverlay();

  const openDialog = useCallback(
    ({
      columnId,
      row,
      rowIndex,
    }: {
      columnId: string;
      row: Partial<TFenestrationEngineAndGuiSchema>;
      rowIndex: number;
    }) => {
      if (isEmptyFenestrationConstructions) {
        toast.error("등록된 개구부 구조체가 없습니다.");
        return;
      }
      const isTransparent = (c: TFenestrationConstructionEngineAndGuiSchema) => {
        return c.is_transparent;
      };
      const isOpaque = (c: TFenestrationConstructionEngineAndGuiSchema) => !isTransparent(c);

      const filteredFenestrationConstructions = (() => {
        if (!row?.type) {
          // 타입이 없을 경우 전체 리스트 반환
          return [];
        }
        if (row.type === EFenestrationType.DOOR) {
          // 종류 - 문: 불투명만 선택 가능
          return fenestration_constructions.filter((c) => isOpaque(c));
        }
        // 종류 - 유리문, 창문 : 투명만 선택 가능
        return fenestration_constructions.filter((c) => isTransparent(c));
      })();

      if (filteredFenestrationConstructions.length === 0) {
        toast.error(
          `개구부 종류와 매칭되는 개구부 구조체가 존재하지 않습니다. 개구부 구조체를 먼저 등록해주세요.`,
        );
        return;
      }

      overlay.open(({ close, isOpen }) => (
        <AddFenestrationConstruction
          columnId={columnId}
          fenestration_constructions={filteredFenestrationConstructions}
          isOpen={isOpen}
          mode="view"
          onClose={close}
          onSelect={({ fenestrationConstructionId }) =>
            setSystemList((prev: Partial<TFenestrationEngineAndGuiSchema>[]) =>
              prev.map((r, idx) =>
                idx === rowIndex ? { ...r, construction_id: fenestrationConstructionId } : r,
              ),
            )
          }
          rowIndex={rowIndex}
          selectedId={row.construction_id || ""}
        />
      ));
    },
    [overlay, fenestration_constructions, setSystemList],
  );

  // 개구부 - 종류가 바뀌었을 때 개구부 구조체 삭제하는 로직 (문/창문,유리문)
  useEffect(() => {
    if (!Array.isArray(systemList) || systemList.length === 0) return;

    let changed = false;
    const next = systemList.map((row) => {
      const r = row as Partial<TFenestrationEngineAndGuiSchema>;
      if (!r?.construction_id) return r;
      if (!r?.type) return r; // 타입이 없으면 유지

      const cons = fenestration_constructions.find((c) => c.id === r.construction_id);
      if (!cons) return r; // 존재하지 않는 id는 여기서 건드리지 않음(별도 검증 루틴에서 처리)

      const ok = r.type === EFenestrationType.DOOR ? !cons.is_transparent : cons.is_transparent;
      if (ok) return r;

      changed = true;
      return { ...r, construction_id: undefined };
    });

    if (changed) setSystemList(next as Partial<TFenestrationEngineAndGuiSchema>[]);
  }, [systemList, fenestration_constructions, setSystemList]);

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
          columns={columns}
          data={systemList}
          errors={validationErrors}
          key={systemList.length}
          label="개구부"
          mode={mode}
          onRegisterComplete={(fn) => {
            clearRef.current = fn;
          }}
          openDialog={openDialog}
          placementSystem={"fenestration"}
          setData={setSystemList}
          setMode={handleChangeMode}
          showRequiredIndicator
          wrapperClassName={"p-0"}
        />
      </div>
    </>
  );
};
