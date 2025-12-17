import { ColumnMeta } from "@tanstack/react-table";

import { TGroupSelectOption, TSelectOption } from "@/components/custom/select/select.types";

/**
 * 붙여넣기 값 변환에 필요한 파라미터 타입
 * selectOptions/groupSelectOptions가 함수일 때만 rowData 사용
 */
export type TGetCellValueParams<T extends object> = {
  cellMeta?: ColumnMeta<T, unknown>;
  pastedRowValue: string;
  rowData: T;
};

/**
 * 붙여넣기 값에 따라 새로운 값을 반환하는 함수
 * @param params TGetCellValueParams
 */
export const getCellValue = <T extends object>(params: TGetCellValueParams<T>): unknown => {
  const { cellMeta, pastedRowValue } = params;
  const { groupSelectOptions, inputType, selectOptions } = cellMeta ?? {};

  // 숫자 타입 처리
  if (inputType === "number") {
    const numberValue = parseFloat(pastedRowValue);
    return isNaN(numberValue) ? 0 : numberValue;
  }

  // 셀렉트 옵션 처리
  if (selectOptions) {
    return findSelectValue(params);
  }

  // 그룹 셀렉트 옵션 처리
  if (groupSelectOptions) {
    return findGroupSelectValue(params);
  }

  // 불리언 타입 처리 (대소문자, 공백 무시)
  if (inputType === "boolean") {
    const normalized = pastedRowValue.trim().toLowerCase();
    return normalized === "true";
  }

  // 기본값(문자열 등)
  return pastedRowValue;
};

/**
 * 그룹 셀렉트 옵션에서 값 찾기
 * @param params TGetCellValueParams
 */
const findGroupSelectValue = <T extends object>(params: TGetCellValueParams<T>): unknown => {
  const { cellMeta, pastedRowValue, rowData } = params;
  const { groupSelectOptions } = cellMeta ?? {};
  if (!groupSelectOptions) return;

  const groupOrOptions: (TGroupSelectOption<unknown> | TSelectOption<unknown>)[] =
    typeof groupSelectOptions === "function" ? groupSelectOptions(rowData) : groupSelectOptions;

  for (const item of groupOrOptions) {
    if ("options" in item) {
      // 그룹 옵션 내부 탐색
      const found = item.options.find(
        ({ label, value }) =>
          isValueEqual({ optionValue: label, pasteValue: pastedRowValue }) ||
          isValueEqual({ optionValue: value, pasteValue: pastedRowValue }),
      );
      if (found) return found.value;
    } else {
      // 단일 옵션 탐색
      if (
        isValueEqual({ optionValue: item.label, pasteValue: pastedRowValue }) ||
        isValueEqual({ optionValue: item.value, pasteValue: pastedRowValue })
      ) {
        return item.value;
      }
    }
  }
};

/**
 * 셀렉트 옵션에서 값 찾기
 * @param params TGetCellValueParams
 */
const findSelectValue = <T extends object>(params: TGetCellValueParams<T>): unknown => {
  const { cellMeta, pastedRowValue, rowData } = params;
  const { selectOptions } = cellMeta ?? {};
  if (!selectOptions) return;

  const options: TSelectOption<unknown>[] =
    typeof selectOptions === "function" ? selectOptions(rowData) : selectOptions;

  const foundValue = options.find(
    (option) =>
      isValueEqual({ optionValue: option.label, pasteValue: pastedRowValue }) ||
      isValueEqual({ optionValue: option.value, pasteValue: pastedRowValue }),
  )?.value;

  return foundValue;
};

/**
 * 값과 붙여넣기 값을 대소문자/공백 무시하고 비교하는 함수
 */
const isValueEqual = ({
  optionValue,
  pasteValue,
}: {
  optionValue: unknown;
  pasteValue: string;
}): boolean => {
  return String(optionValue).trim().toLowerCase() === pasteValue.trim().toLowerCase();
};
