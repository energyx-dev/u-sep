export enum ConstantEnergyKeyEnum {
  DISTRICT_HEATING = "district_heating", // 지역난방
  ELECTRICITY = "electricity", // 전기
  NATURAL_GAS = "natural_gas", // 가스
  OIL = "oil", // 유류
}

export enum EnergySourceKeyEnum {
  DISTRICTHEATING = "DISTRICTHEATING", // 지역난방
  ELECTRICITY = "ELECTRICITY", // 전기
  NATURALGAS = "NATURALGAS", // 가스
  OIL = "OIL", // 유류,
}

export enum EResultEffect {
  FOREST_CREATION = "산림조성효과",
  PLANTING_EFFECT = "식재 효과",
  REPLACEMENT_OF_CARS = "승용차 대체효과",
}

export enum EResults {
  CO2 = "co2",
  SITE_USES = "site_uses",
  SOURCE_USES = "source_uses",
}

export enum UseCategoryKeyEnum {
  CIRCULATION = "circulation", // 환기
  COOLING = "cooling", // 냉방
  GENERATORS = "generators", // 발전
  HEATING = "heating", // 난방
  HOTWATER = "hotwater", // 급탕
  LIGHTING = "lighting", // 조명
}

export const CONSTANT_ENERGY_LABELS: Record<ConstantEnergyKeyEnum, string> = {
  [ConstantEnergyKeyEnum.DISTRICT_HEATING]: "지역난방",
  [ConstantEnergyKeyEnum.ELECTRICITY]: "전기",
  [ConstantEnergyKeyEnum.NATURAL_GAS]: "가스",
  [ConstantEnergyKeyEnum.OIL]: "유류",
};
