import { z } from "zod";

import { DUPLICATE_NAME_ERROR_MESSAGE } from "@/lib/message-helper";

export type TTableError = {
  columnId: string;
  errorMessage: string;
  rowIndex: number;
};

export type TTableErrorCheckItem = object & { name?: string; rowIndex: number };

export type TTableErrorCheckResult = TTableErrorResult | TTableErrorSuccessResult;

type TTableErrorResult = {
  errors: TTableError[];
  isValid: false;
};

type TTableErrorSuccessResult = {
  data: TTableErrorCheckItem[];
  errors: TTableError[];
  isValid: true;
};

export const getTableErrors = ({
  data,
  existingNameList,
  schema,
  setErrorMap,
}: {
  data: TTableErrorCheckItem[];
  existingNameList?: string[];
  schema: z.ZodType<object>;
  setErrorMap?: z.ZodErrorMap;
}): TTableErrorCheckResult => {
  const errors: TTableError[] = [];

  // 스키마 유효성 검사
  data.forEach(({ rowIndex, ...item }) => {
    const result = schema.safeParse(item, { errorMap: setErrorMap ?? z.getErrorMap() });
    if (!result.success) {
      result.error.errors.forEach((error) => {
        const errorItem: TTableError = {
          columnId: `${error.path[0]}`,
          errorMessage: error.message,
          rowIndex: rowIndex,
        };
        errors.push(errorItem);
      });
    }
  });

  // 저장된 이름에서 중복검사
  if (existingNameList?.length) {
    const duplicateNameList = getDuplicateCheckByExistingNameList(data, existingNameList);
    if (duplicateNameList.length > 0) {
      duplicateNameList.forEach((item) => {
        errors.push({
          columnId: "name",
          errorMessage: DUPLICATE_NAME_ERROR_MESSAGE,
          rowIndex: item.rowIndex,
        });
      });
    }
  }

  // 테이블 내에서 중복검사
  const duplicateNameList = getDuplicateNameList(data);
  if (duplicateNameList.length > 0) {
    duplicateNameList.forEach((item) => {
      errors.push({
        columnId: "name",
        errorMessage: DUPLICATE_NAME_ERROR_MESSAGE,
        rowIndex: item.rowIndex,
      });
    });
  }

  if (errors.length > 0) {
    return {
      errors,
      isValid: false,
    };
  } else {
    return {
      data: data,
      errors: [],
      isValid: true,
    };
  }
};

/**
 * 저장된 이름 리스트에서 중복검사
 */
export const getDuplicateCheckByExistingNameList = (
  data: TTableErrorCheckItem[],
  existingNameList: string[],
) => {
  const duplicateNameList = data.filter((item) => {
    return existingNameList.includes(item?.name ?? "");
  });

  return duplicateNameList;
};

/**
 * 객체 배열에서 특정 key가 중복된 객체 반환 함수
 */
const getDuplicateNameList = (data: TTableErrorCheckItem[]) => {
  const nameCount = data.reduce<Record<string, number>>((acc, curr) => {
    if (curr.name) {
      acc[curr.name] = (acc[curr.name] ?? 0) + 1;
    }
    return acc;
  }, {});

  return data.filter((item) => nameCount[item.name ?? ""] > 1);
};
