import { ColumnDef } from "@tanstack/react-table";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { sourceSystemGuiAddSchema } from "@/domain/systems/source/schemas/source-system-add.schema";
import { sourceSystemErrorMap } from "@/domain/systems/source/schemas/source-system.error-map";
import {
  TBoilerEngineSchema,
  TSourceSystemGuiSchema,
} from "@/domain/systems/source/schemas/source-system.schema";
import { SOURCE_SYSTEM_COLUMN } from "@/domain/systems/source/utils/sourceSystem.helper";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useValidateTableErrors } from "@/hooks/useValidateTableErrors";
import { ADD_SOURCE_SYSTEM_MESSAGE, UPDATE_SOURCE_SYSTEM_MESSAGE } from "@/lib/message-helper";
import { customNanoid, isStrictEmptyObject } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

interface IParams {
  mode: TViewMode;
  onClose?: () => void;
  savedSystemList: TSourceSystemGuiSchema[ESourceSystemType];
  sourceSystemType: ESourceSystemType;
}

// 삭제 하려는 생산 설비 ID가 공급 설비 - 생산 설비 항목에서 사용 중인지 확인
export const checkSourceSystemUsage = (deletedIds: string[]) => {
  const supplySystemState = useSupplySystemStore.getState();
  const usedSourceSystemIds = new Set<string>();

  Object.values(supplySystemState).forEach((systemArray) => {
    if (Array.isArray(systemArray)) {
      systemArray.forEach((item) => {
        if ("source_system_id" in item && item.source_system_id) {
          if (deletedIds.includes(item.source_system_id)) {
            usedSourceSystemIds.add(item.source_system_id);
          }
        }
      });
    }
  });
  return usedSourceSystemIds;
};

export const useEditSourceSystem = ({
  mode,
  onClose,
  savedSystemList,
  sourceSystemType,
}: IParams) => {
  const columns = SOURCE_SYSTEM_COLUMN[sourceSystemType];
  const schema = sourceSystemGuiAddSchema[sourceSystemType];

  type TDataType = z.infer<typeof schema>;
  const isEdit = mode === "edit";
  const initSystemList = isEdit ? savedSystemList : [{}];

  const [systemList, setSystemList] = useState<Partial<TDataType>[]>(initSystemList);

  useEffect(() => {
    setSystemList(initSystemList);
  }, [savedSystemList]);

  // 추가 모드에서만 저장된 이름으로 중복 검사
  const existingNameList = useMemo(() => {
    if (isEdit) return [];

    const nameList = new Set(savedSystemList?.map((item) => item.name));
    return Array.from(nameList);
  }, [isEdit, savedSystemList]);

  const filteredEmptySystemList = useMemo(
    () =>
      systemList
        .map((e, i) => ({ ...e, rowIndex: i }))
        .filter(
          (item) => !isStrictEmptyObject({ obj: item, removeKeys: ["id", "type", "rowIndex"] }),
        ),
    [systemList],
  );

  const { disabled, validationResult } = useValidateTableErrors({
    data: filteredEmptySystemList,
    existingNameList,
    schema,
    setErrorMap: sourceSystemErrorMap,
  });

  const { addSourceSystem, syncSourceSystem } = useDataSyncActions();

  const transformSourceSystemRow = (rest: Partial<TDataType>, type: ESourceSystemType) => {
    const baseItem = rest as TSourceSystemGuiSchema[ESourceSystemType][number];

    switch (type) {
      case ESourceSystemType.ABSORPTION_CHILLER: {
        const acItem = rest as TSourceSystemGuiSchema[ESourceSystemType.ABSORPTION_CHILLER][number];
        return {
          ...acItem,
          boiler_efficiency:
            typeof acItem.boiler_efficiency === "number"
              ? new Decimal(acItem.boiler_efficiency).div(100).toNumber()
              : undefined,
          id: (acItem as { id?: string }).id ?? customNanoid(16),
          name: acItem.name,
          type,
        };
      }

      case ESourceSystemType.BOILER: {
        const boilerItem = rest as TBoilerEngineSchema;
        return {
          ...boilerItem,
          efficiency:
            typeof boilerItem.efficiency === "number"
              ? new Decimal(boilerItem.efficiency).div(100).toNumber()
              : undefined,
          id: boilerItem.id ?? customNanoid(16),
          name: boilerItem.name,
          type,
        };
      }

      default: {
        return {
          ...rest,
          id: (baseItem as { id?: string }).id ?? customNanoid(16),
          name: baseItem.name,
          type,
        };
      }
    }
  };

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    if (!validationResult?.isValid) return;

    const updateData = filteredEmptySystemList.map(({ rowIndex: _, ...rest }) =>
      transformSourceSystemRow(rest as Partial<TDataType>, sourceSystemType),
    );

    if (isEdit) {
      syncSourceSystem(sourceSystemType, updateData);
      setSystemList(updateData);
      toast.success(UPDATE_SOURCE_SYSTEM_MESSAGE.success);
    } else {
      addSourceSystem(sourceSystemType, updateData);
      setSystemList(updateData);
      toast.success(ADD_SOURCE_SYSTEM_MESSAGE.success);
    }

    onClose?.();
  }, [
    addSourceSystem,
    disabled,
    filteredEmptySystemList,
    isEdit,
    onClose,
    sourceSystemType,
    syncSourceSystem,
    validationResult,
    savedSystemList,
  ]);

  return {
    columns: columns as ColumnDef<TDataType, unknown>[],
    disabled,
    handleSubmit,
    setSourceSystemList: setSystemList,
    sourceSystemList: systemList,
    validationErrors: validationResult?.errors ?? [],
  };
};
