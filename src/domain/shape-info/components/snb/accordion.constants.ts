/**
 * 아코디언 컴포넌트에서 사용하는 공통 스타일 상수
 */
export const ACCORDION_STYLES = {
  /** 기본 텍스트 스타일 */
  defaultText: "text-neutral400 text-sm font-normal",

  /** 아이콘 기본 스타일 */
  iconBase: "text-neutral240 size-5",

  /** 아이콘 크기 */
  iconSize: "size-3.5",

  /** 아이템 컨테이너 스타일 */
  itemContainer: "flex items-center gap-0.5",

  /** 삭제 버튼 스타일 - 호버 시에만 표시됨 */
  removeButton:
    "cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-50",

  /** 선택된 아이템 텍스트 스타일 */
  selectedText: "text-primary font-semibold",

  /** 트리거 기본 스타일 */
  triggerBase: "group flex h-8 cursor-pointer items-center py-0 pr-1 hover:no-underline",
} as const;

/**
 * 패딩 레벨 상수
 */
export const PADDING_LEVELS = {
  /** 층 레벨 패딩 */
  FLOOR: "pl-[14px]",

  /** 면 레벨 패딩 */
  SURFACE: "pl-[42px]",

  /** 존 레벨 패딩 */
  ZONE: "pl-[28px]",
} as const;

/**
 * 삭제 확인 다이얼로그 텍스트 상수
 */
export const DELETE_DIALOG_TEXTS = {
  closeText: "아니요",
  confirmText: "네, 삭제할게요",

  getDescription: (name: string) => {
    return `${name}에 포함된 모든 형상 정보를 삭제하시겠습니까?`;
  },

  titles: {
    floor: "층 삭제",
    surface: "면 삭제",
    zone: "존 삭제",
  },
} as const;
