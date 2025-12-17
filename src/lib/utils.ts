import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스들을 병합하고 충돌을 해결합니다.
 * @param inputs - 병합할 클래스 값들
 * @returns 병합된 클래스 문자열
 * @example
 * cn("px-2 py-1", "bg-red-500", "hover:bg-red-600")
 * // => "px-2 py-1 bg-red-500 hover:bg-red-600"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 객체의 모든 프로퍼티 값이 빈 배열인지 확인합니다.
 * @param obj - 검사할 객체 (모든 프로퍼티 값이 배열이어야 함)
 * @returns 모든 프로퍼티 값이 빈 배열이면 true, 아니면 false
 * @example
 * isAllArraysEmpty({ a: [], b: [] }) // => true
 * isAllArraysEmpty({ a: [], b: [1] }) // => false
 */
export function isAllArraysEmpty<T extends Record<string, unknown[]>>(obj: T): boolean {
  if (!obj || typeof obj !== "object") return false;
  return Object.values(obj).every((arr) => Array.isArray(arr) && arr.length === 0);
}

/**
 * 객체가 비어있는지 확인합니다.
 * @param obj - 검사할 객체
 * @returns 객체가 비어있으면 true, 아니면 false
 * @example
 * isEmptyObject({}) // => true
 * isEmptyObject({ a: 1 }) // => false
 */
export function isEmptyObject(obj: object): boolean {
  if (!obj || typeof obj !== "object") return false;
  return Object.keys(obj).length === 0;
}

/**
 * 배열의 모든 요소가 빈 객체인지 확인합니다.
 * @param list - 검사할 객체 배열
 * @returns 모든 요소가 빈 객체이면 true, 아니면 false
 * @example
 * isEmptyObjectList([{}, {}]) // => true
 * isEmptyObjectList([{}, { a: 1 }]) // => false
 */
export function isEmptyObjectList<T extends object>(list: T[]): boolean {
  if (!Array.isArray(list)) return false;
  return list.every((item) => item !== null && typeof item === "object" && isEmptyObject(item));
}

/**
 * 객체가 엄격하게 비어있는지 확인합니다.
 * 빈 객체이거나 모든 프로퍼티 값이 falsy 값인 경우를 포함합니다.
 * @param obj - 검사할 객체
 * @param removeKeys - 제외할 키 배열
 * @param allowNullKeys - null 값을 허용할 키 배열
 * @returns 객체가 엄격하게 비어있으면 true, 아니면 false
 * @example
 * isStrictEmptyObject({}) // => true
 * isStrictEmptyObject({ a: "", b: null }, ["a"]) // => false
 * isStrictEmptyObject({ a: 1 }) // => false
 * isStrictEmptyObject({ a: null }, [], ["a"]) // => false
 */
export function isStrictEmptyObject({
  allowNullKeys,
  obj,
  removeKeys,
}: {
  allowNullKeys?: string[];
  obj: object;
  removeKeys?: string[];
}): boolean {
  if (!obj || typeof obj !== "object") return false;

  const filteredObj = removeKeys
    ? Object.fromEntries(Object.entries(obj).filter(([key]) => !removeKeys.includes(key)))
    : obj;

  return (
    Object.keys(filteredObj).length === 0 ||
    Object.entries(filteredObj).every(([key, value]) => {
      // allowNullKeys에 포함된 키는 null 값을 허용
      if (allowNullKeys?.includes(key) && value === null) {
        return false;
      }
      return isStrictFalsy(value);
    })
  );
}

/**
 * 값이 엄격한 falsy 값인지 확인합니다.
 * @param value - 검사할 값
 * @returns 값이 빈 문자열(""), null, 또는 undefined이면 true, 아니면 false
 * @example
 * isStrictFalsy("") // => true
 * isStrictFalsy(null) // => true
 * isStrictFalsy(undefined) // => true
 * isStrictFalsy(0) // => false
 * isStrictFalsy(false) // => false
 */
export function isStrictFalsy(value: unknown): value is "" | null | undefined {
  return value === "" || value === null || value === undefined;
}

/**
 * 값이 유효한 숫자인지 확인합니다.
 * @param value - 검사할 값 (숫자 또는 문자열)
 * @returns 값이 유효한 숫자이면 true, 아니면 false
 * @example
 * isValidNumber(123) // => true
 * isValidNumber("123") // => true
 * isValidNumber("abc") // => false
 * isValidNumber(Infinity) // => false
 * isValidNumber(NaN) // => false
 */
export function isValidNumber(value: number | string): boolean {
  if (typeof value === "number") {
    return !isNaN(value) && isFinite(value);
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return false;
  }

  const num = Number(trimmedValue);
  return !isNaN(num) && isFinite(num);
}

/**
 * 소수점 자릿수를 검증하는 함수
 * @param params 검증 파라미터 객체
 * @param params.value 검증할 숫자
 * @param params.maxDecimalPlaces 허용할 최대 소수점 자릿수
 * @returns 소수점 자릿수가 허용 범위 내인지 여부
 * @example
 * validateDecimalPlaces({ value: 3.14, maxDecimalPlaces: 2 }) // => true
 * validateDecimalPlaces({ value: 3.141, maxDecimalPlaces: 2 }) // => false
 * validateDecimalPlaces({ value: 3, maxDecimalPlaces: 2 }) // => true
 */
export const validateDecimalPlaces = ({
  maxDecimalPlaces,
  value,
}: {
  maxDecimalPlaces: number;
  value: number;
}): boolean => {
  const decimalPlaces = value.toString().split(".")[1]?.length ?? 0;
  return decimalPlaces <= maxDecimalPlaces;
};

export const createUniqueId = ({ id, signature }: { id: string; signature: string }) => {
  return `${id}-${signature}`;
};

export const customNanoid = (size: number) =>
  customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", size)();

export const getPlacementDescription = (
  type: "multiple" | "single",
  itemName: string | undefined,
) => {
  if (type === "multiple") {
    return `${itemName ?? "설비"}을/를 형상에 배치합니다. 기존에 선택된 항목이 있는 경우, 항목 또는 개수가 추가됩니다.`;
  }

  // single
  return `${itemName ?? "설비"}을/를 형상에 배치합니다. 기존에 선택된 항목이 있는 경우, 새로운 항목으로 대체됩니다.`;
};

type TFormatCurrencyOptions = {
  fractionDigits?: number;
  locale?: string;
};

export const formatCurrency = (
  value: number,
  { fractionDigits = 2, locale }: TFormatCurrencyOptions = {},
) => {
  return value.toLocaleString(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
};
