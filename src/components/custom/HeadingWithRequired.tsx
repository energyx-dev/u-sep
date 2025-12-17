interface IProps {
  heading: string;
  isEdit?: boolean;
}

export const PAGE_TITLES = {
  BUILDING_INFO: "기본 정보",
  BUILDING_OVERVIEW: "리모델링 버전 이름",
  FENESTRATION: "개구부",
  FENESTRATION_CONSTRUCTION: "개구부 구조체",
  FLOOR: "층 이름 (층 숫자)",
  LIGHTNING: "조명",
  MATERIAL: "재료",
  RENEWABLE_SYSTEM: "신재생",
  SOURCE_SYSTEM: "생산 설비",
  SUPPLY_SYSTEM: "공급 설비",
  SURFACE: "면 이름",
  SURFACE_CONSTRUCTION: "면 구조체",
  VENTILATION_SYSTEM: "환기 설비",
  ZONE: "존 이름",
};

export const HeadingWithRequired = ({ heading, isEdit = true }: IProps) => {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-4xl font-semibold">{heading}</h1>
      {isEdit && (
        <p className="text-neutral560 text-sm">
          <span className="text-negative">*</span>: 필수 항목
        </p>
      )}
    </div>
  );
};
