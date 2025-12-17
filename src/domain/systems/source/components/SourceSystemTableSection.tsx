import Decimal from "decimal.js";
import { useEffect, useRef } from "react";

import { TableSection } from "@/components/table/TableSection";
import { Button } from "@/components/ui/button";
import { NewEditTable } from "@/domain/systems/components/NewEditTable";
import { SOURCE_SYSTEM_LABEL } from "@/domain/systems/source/constants/source-system.constants";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import {
  checkSourceSystemUsage,
  useEditSourceSystem,
} from "@/domain/systems/source/hooks/useEditSourceSystem";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { useActionEditTable } from "@/hooks/useActionEditTable";
import { useNewConfirmDialog } from "@/hooks/useNewConfirmDialog";
import { useTableSectionViewMode } from "@/hooks/useTableSectionViewMode";

interface IProps {
  sourceSystem: TSourceSystemGuiSchema[ESourceSystemType];
  sourceSystemType: ESourceSystemType;
}

export const SourceSystemTableSection = ({ sourceSystem, sourceSystemType }: IProps) => {
  const clearRef = useRef<() => void>(() => {});
  const { handleChangeMode, isEdit, mode } = useTableSectionViewMode();
  const { columns, handleSubmit, setSourceSystemList, sourceSystemList, validationErrors } =
    useEditSourceSystem({
      mode: "edit",
      savedSystemList: sourceSystem,
      sourceSystemType,
    });

  const { openNewConfirmDialog } = useNewConfirmDialog();

  const actionEditTable = useActionEditTable({
    data: sourceSystemList as Partial<{ id?: string; name: string }>[],
    onBeforeDelete: async (deletedItems) => {
      const deletedIds = deletedItems.filter((item) => item.id).map((item) => item.id!);

      if (deletedIds.length > 0) {
        const usedSourceSystemIds = checkSourceSystemUsage(deletedIds);

        if (usedSourceSystemIds.size > 0) {
          const usedSourceSystemNames = sourceSystem
            .filter((l) => usedSourceSystemIds.has(l.id))
            .map((l) => l.name)
            .join(", ");

          const confirm = await openNewConfirmDialog({
            confirmText: "확인",
            description: `${usedSourceSystemNames}이(가) 선택된 공급 설비가 있어 삭제할 수 없습니다.\n\n공급 설비에서 먼저 선택 해제 해주세요.`,
            title: "생산 설비 삭제 불가",
          });

          return !confirm;
        }
      }
      return true;
    },
    setData: setSourceSystemList,
  });
  const { handleDeleteRow, resetCheckedRows } = actionEditTable;

  // UI 표시용 스케일 변환 헬퍼 (타입별 퍼센트 스케일 적용)
  const scaleSourceSystemForUI = (
    list: TSourceSystemGuiSchema[ESourceSystemType],
    type: ESourceSystemType,
  ) => {
    switch (type) {
      case ESourceSystemType.ABSORPTION_CHILLER: {
        const mapped = (list as TSourceSystemGuiSchema[ESourceSystemType.ABSORPTION_CHILLER]).map(
          (item) =>
            typeof item.boiler_efficiency === "number"
              ? {
                  ...item,
                  boiler_efficiency: new Decimal(item.boiler_efficiency).times(100).toNumber(),
                }
              : item,
        );
        return mapped as TSourceSystemGuiSchema[ESourceSystemType];
      }
      case ESourceSystemType.BOILER: {
        const mapped = (list as TSourceSystemGuiSchema[ESourceSystemType.BOILER]).map((item) =>
          typeof item.efficiency === "number"
            ? { ...item, efficiency: new Decimal(item.efficiency).times(100).toNumber() }
            : item,
        );
        return mapped as TSourceSystemGuiSchema[ESourceSystemType];
      }
      default:
        return list;
    }
  };

  useEffect(() => {
    type Item = TSourceSystemGuiSchema[ESourceSystemType][number];

    if (!sourceSystem || sourceSystem.length === 0) {
      setSourceSystemList([]);
      return;
    }

    const scaled = scaleSourceSystemForUI(sourceSystem, sourceSystemType);
    setSourceSystemList(scaled as unknown as Partial<Item>[]);
  }, [sourceSystem, sourceSystemType]);

  const LABEL = SOURCE_SYSTEM_LABEL[sourceSystemType];

  const handleCancel = () => {
    setSourceSystemList(scaleSourceSystemForUI(sourceSystem, sourceSystemType));
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
        columns={columns}
        data={sourceSystemList}
        errors={validationErrors}
        key={sourceSystemList.length}
        label={LABEL}
        mode={mode}
        onRegisterComplete={(fn) => {
          clearRef.current = fn;
        }}
        setData={setSourceSystemList}
        setMode={handleChangeMode}
        showRequiredIndicator
        wrapperClassName={"p-0"}
      />
    </>
  );
};
