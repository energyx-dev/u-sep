import { josa } from "es-hangul";

export const ADD_SOURCE_SYSTEM_MESSAGE = {
  success: "설비가 추가되었습니다.",
};

export const UPDATE_SOURCE_SYSTEM_MESSAGE = {
  success: "설비가 변경되었습니다.",
};

export const SUCCESS_MESSAGES = {
  add: (label?: string) => `${label ? josa(label, "이/가") : ""} 추가되었습니다.`.trim(),
  delete: (label?: string) => `${label ? josa(label, "이/가") : ""} 삭제되었습니다.`.trim(),
  update: (label?: string) => `${label ? josa(label, "이/가") : ""} 변경되었습니다.`.trim(),
};

export const ERROR_MESSAGES = {
  decimalPlaces: ({ label, maxDecimalPlaces }: { label: string; maxDecimalPlaces: number }) =>
    `${josa(label, "은/는")} 소수점 ${maxDecimalPlaces}자리까지 입력해주세요.`,
  invalid: "유효하지 않은 값이 입력되었습니다.",
  number: "숫자를 입력해주세요.",
  numberRange: ({ label, max, min }: { label: string; max: number; min: number }) =>
    `${josa(label, "은/는")} ${min}에서 ${max} 사이여야 합니다.`,
  numberRangeExtended: getNumberRangeMessage,
  required: (label: string) => `${josa(label, "은/는")} 필수입니다.`, // TODO requiredTable로 이름 바꾸기
  requiredField: (label: string) => `${josa(label, "을/를")} 입력해주세요.`,
  requiredSelectField: (label: string) => `${josa(label, "을/를")} 선택해주세요.`,
};

export const TABLE_EMPTY_MESSAGE = {
  empty: (label: string) => `${josa(label, "은/는")} 별도의 입력값이 없습니다.`,
};

type TRangeType = "gt" | "gt-lt" | "gt-lte" | "gte" | "gte-lt" | "gte-lte" | "lt" | "lte";

/**
 * 숫자 입력 범위에 대한 안내 문구를 생성합니다.
 * @param label - 값의 이름 또는 필드 라벨 (예: "나이", "점수")
 * @param min - 허용되는 최소값
 * @param max - 허용되는 최대값
 * @param type - 범위 비교 타입 ("gt" | "gte" | "lt" | "lte" | "gt-lt" | "gt-lte" | "gte-lt" | "gte-lte")
 * @returns "{라벨}은/는 {min} {타입 A}, {max} {타입 B} 값을 입력 가능합니다." 형식의 문구
 */
export function getNumberRangeMessage({
  label,
  max,
  min,
  type,
}: {
  label: string;
  max?: number;
  min?: number;
  type: TRangeType;
}) {
  switch (type) {
    // 단일 비교 타입
    case "gt":
      return `${josa(label, "은/는")} ${min} 초과의 값을 입력 가능합니다.`;
    // 복합 비교 타입
    case "gt-lt":
      return `${josa(label, "은/는")} ${min} 초과, ${max} 미만 값을 입력 가능합니다.`;
    case "gt-lte":
      return `${josa(label, "은/는")} ${min} 초과, ${max} 이하 값을 입력 가능합니다.`;
    case "gte":
      return `${josa(label, "은/는")} ${min} 이상의 값을 입력 가능합니다.`;

    case "gte-lt":
      return `${josa(label, "은/는")} ${min} 이상, ${max} 미만 값을 입력 가능합니다.`;
    case "gte-lte":
      return `${josa(label, "은/는")} ${min} 이상, ${max} 이하 값을 입력 가능합니다.`;
    case "lt":
      return `${josa(label, "은/는")} ${max} 미만의 값을 입력 가능합니다.`;
    case "lte":
      return `${josa(label, "은/는")} ${max} 이하의 값을 입력 가능합니다.`;

    // 기본
    default:
      return `${josa(label, "은/는")} 올바른 범위여야 합니다.`;
  }
}

/**
 * 입력 길이 제한 안내 문구를 생성합니다.
 * @param name - 필드 이름
 * @param limit - 글자 수 제한
 * @returns "{이름}은/는 {숫자}자 이내로 입력 가능합니다." 형식의 문구
 */
export const getInputLengthLimitMessage = (name: string, limit: number) => {
  return `${name}은/는 ${limit}자 이내로 입력 가능합니다.`;
};

export const DUPLICATE_NAME_ERROR_MESSAGE = "이미 등록된 이름입니다.";

export const REQUIRED_MESSAGE = "필수 입력 항목입니다.";
export const INTEGER_MESSAGE = "정수만 입력해주세요.";
export const STRING_MESSAGE = "문자만 입력해주세요.";
export const MIN_ZERO_MESSAGE = "0 이상의 숫자만 입력해주세요.";
export const MAX_STR_MESSAGE = (max: number) => `${max}자 이내로 입력해주세요.`;
export const MAX_NUM_MESSAGE = (max: number) => `${max} 이하의 숫자만 입력해주세요.`;
