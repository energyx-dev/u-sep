export enum ECompressorType {
  RECIPROCATING = "reciprocating",
  SCREW = "screw",
  TURBO = "turbo",
}

export enum ECoolingTowerControlType {
  SINGLE_SPEED = "single-speed",
  TWO_SPEED = "two-speed",
}

export enum ECoolingTowerType {
  CLOSED = "closed", // 폐쇄형 건식
  OPEN = "open", // 개방형 습식
}

export enum EFuelType {
  DISTRICT_HEATING = "district_heating",
  ELECTRICITY = "electricity",
  NATURAL_GAS = "natural_gas",
  OIL = "oil",
}

export enum ESourceSystemType {
  ABSORPTION_CHILLER = "absorption_chiller", // 흡수식 냉동기
  BOILER = "boiler", // 보일러
  CHILLER = "chiller", // 냉동기
  DISTRICT_HEATING = "district_heating", // 지역난방
  GEOTHERMAL_HEATPUMP = "geothermal_heatpump", // 지열 히트펌프
  HEATPUMP = "heatpump", // 히트펌프
}
