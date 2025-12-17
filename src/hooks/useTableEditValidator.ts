import { useCallback, useEffect, useMemo, useState } from "react";
import { ZodErrorMap, ZodSchema } from "zod";

import { useValidateTableErrors } from "@/hooks/useValidateTableErrors";
import { customNanoid, isStrictEmptyObject } from "@/lib/utils";
import { TViewMode } from "@/types/view-mode.type";

interface IParams<T extends TData> {
  addAction: (data: T[]) => void;
  mode: TViewMode;
  onClose?: () => void;
  savedList: T[];
  schema: ZodSchema<object>;
  setErrorMap?: ZodErrorMap;
  syncAction: (data: T[]) => void;
}

type TData = { id?: string; name: string };

// TODO mode 제거 예정 (항상 edit 모드)
export const useTableEditValidator = <T extends TData>({
  addAction,
  mode,
  onClose,
  savedList,
  schema,
  setErrorMap,
  syncAction,
}: IParams<T>) => {
  const isEdit = mode === "edit";
  const initSystemList = isEdit ? savedList : [{}];

  const [systemList, setSystemList] = useState<Partial<T>[]>(initSystemList);

  useEffect(() => {
    setSystemList(initSystemList);
  }, [savedList]);

  // 추가 모드에서만 저장된 이름으로 중복 검사
  const existingNameList = useMemo(() => {
    if (isEdit) return [];

    const nameList = new Set(savedList?.map((item) => item.name));
    return Array.from(nameList);
  }, [isEdit, savedList]);

  const filteredEmptySystemList = useMemo(
    () =>
      systemList
        .map((e, i) => ({ ...e, rowIndex: i }))
        .filter((item) => !isStrictEmptyObject({ obj: item, removeKeys: ["id", "rowIndex"] })),
    [systemList],
  );

  const { disabled, validationResult } = useValidateTableErrors({
    data: filteredEmptySystemList,
    existingNameList,
    schema,
    setErrorMap,
  });

  const handleSubmit = useCallback(async () => {
    if (disabled) return;
    if (!validationResult?.isValid) return;

    const updateDataList: T[] = validationResult.data.map(({ rowIndex: _, ...rest }) => {
      const item = rest as T;
      const updateData: T = {
        ...item,
        id: item.id ?? customNanoid(16),
      };
      return updateData;
    });

    if (isEdit) {
      syncAction(updateDataList);
    } else {
      addAction(updateDataList);
    }

    onClose?.();
  }, [addAction, disabled, isEdit, onClose, savedList, syncAction, validationResult]);

  return {
    disabled,
    handleSubmit,
    setSystemList,
    systemList,
    validationErrors: validationResult?.errors,
  };
};
