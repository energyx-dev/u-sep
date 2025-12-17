import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { TSelectOption } from "@/components/custom/select/select.types";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useDynamicSupplySystemColumns } from "@/domain/systems/supply/hooks/useDynamicSupplySystemColumns";
import { supplySystemGuiAddSchema } from "@/domain/systems/supply/schemas/supply-system-add.schema";
import { supplySystemErrorMap } from "@/domain/systems/supply/schemas/supply-system.error-map";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { useValidateTableErrors } from "@/hooks/useValidateTableErrors";
import { ADD_SOURCE_SYSTEM_MESSAGE, UPDATE_SOURCE_SYSTEM_MESSAGE } from "@/lib/message-helper";
import { customNanoid, isStrictEmptyObject } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

interface IParams {
  mode: TViewMode;
  onClose?: () => void;
  savedSystemList: TSupplySystemGuiSchema[ESupplySystemType];
  supplySystemType: ESupplySystemType;
}

export const useEditSupplySystem = ({
  mode,
  onClose,
  savedSystemList,
  supplySystemType,
}: IParams) => {
  const schema = supplySystemGuiAddSchema[supplySystemType];
  const { columns } = useDynamicSupplySystemColumns(supplySystemType);

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
          (item) =>
            !isStrictEmptyObject({
              allowNullKeys: ["purpose"],
              obj: item,
              removeKeys: ["rowIndex"],
            }),
        ),
    [systemList],
  );

  const { disabled, validationResult } = useValidateTableErrors({
    data: filteredEmptySystemList,
    existingNameList,
    schema,
    setErrorMap: supplySystemErrorMap,
  });

  const { addSupplySystem, syncSupplySystem } = useDataSyncActions();

  const handleSubmit = useCallback(async () => {
    if (disabled) return;
    if (!validationResult?.isValid) return;

    const updateData = validationResult.data.map(({ rowIndex: _, ...rest }) => {
      const item = rest as TSupplySystemGuiSchema[ESupplySystemType][number];

      return {
        ...rest,
        id: item.id ?? customNanoid(16),
        name: item.name,
        type: supplySystemType,
      } as unknown as TSupplySystemGuiSchema[ESupplySystemType][number];
    }) as TSupplySystemGuiSchema[ESupplySystemType];

    if (isEdit) {
      syncSupplySystem(supplySystemType, updateData);
      setSystemList(updateData);
      toast.success(UPDATE_SOURCE_SYSTEM_MESSAGE.success);
    } else {
      addSupplySystem(supplySystemType, updateData);
      setSystemList(updateData);
      toast.success(ADD_SOURCE_SYSTEM_MESSAGE.success);
    }

    onClose?.();
  }, [
    addSupplySystem,
    disabled,
    isEdit,
    onClose,
    supplySystemType,
    syncSupplySystem,
    validationResult,
    savedSystemList,
  ]);

  const handleChangeSystemList = (newList: Partial<TDataType>[]) => {
    const updatedList = newList.map((newItem, idx) => {
      const prevItem = systemList[idx];

      // purpose 값 검증 및 정규화
      const normalizedPurpose = validateAndNormalizePurpose(newItem);

      // source_system_id 값 검증 및 정규화 (타입 가드 적용)
      const normalizedSourceSystemId = validateAndNormalizeSourceSystemId(newItem);

      // purpose가 변경된 경우 source_system_id 초기화
      if (prevItem && prevItem.purpose !== newItem.purpose) {
        return {
          ...newItem,
          purpose: normalizedPurpose,
          source_system_id: undefined,
        };
      }

      return {
        ...newItem,
        purpose: normalizedPurpose,
        source_system_id: normalizedSourceSystemId,
      };
    });

    setSystemList(updatedList);
  };

  // purpose 값 검증 및 정규화 함수
  const validateAndNormalizePurpose = useCallback(
    (item: Partial<TDataType>) => {
      const purposeColumnMeta = columns.find((column) => column.id === "purpose")?.meta;

      if (purposeColumnMeta && "selectOptions" in purposeColumnMeta) {
        let foundPurpose: EPurpose | null = null;

        if (typeof purposeColumnMeta.selectOptions !== "function") {
          foundPurpose = purposeColumnMeta.selectOptions?.find(
            (option: TSelectOption) => option.value === item.purpose,
          )?.value as EPurpose;
        }

        return foundPurpose;
      } else {
        return item.purpose;
      }
    },
    [columns],
  );

  // source_system_id 값 검증 및 정규화 함수 (목적과 동일한 구조)
  const validateAndNormalizeSourceSystemId = useCallback(
    (item: Partial<TDataType>) => {
      const sourceColumnMeta = columns.find((column) => column.id === "source_system_id")?.meta;

      if (sourceColumnMeta && "selectOptions" in sourceColumnMeta) {
        let foundId: null | string = null;

        if (typeof sourceColumnMeta.selectOptions !== "function") {
          foundId = sourceColumnMeta.selectOptions?.find(
            (option: TSelectOption) =>
              option.value === (item as { source_system_id?: null | string }).source_system_id,
          )?.value as string;
        }

        return foundId;
      } else {
        return (item as { source_system_id?: null | string }).source_system_id ?? null;
      }
    },
    [columns],
  );

  return {
    columns: columns as ColumnDef<TDataType, unknown>[],
    disabled,
    handleSubmit,
    setSystemList: handleChangeSystemList,
    systemList,
    validationErrors: validationResult?.errors ?? [],
  };
};
