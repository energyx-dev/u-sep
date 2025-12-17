import {
  ECompressorType,
  ECoolingTowerControlType,
  ECoolingTowerType,
  EFuelType,
  ESourceSystemType,
} from "@/domain/systems/source/constants/sourceSystem.enums";

export const SOURCE_SYSTEM_LABEL: Record<ESourceSystemType, string> = {
  [ESourceSystemType.ABSORPTION_CHILLER]: "흡수식 냉동기",
  [ESourceSystemType.BOILER]: "보일러",
  [ESourceSystemType.CHILLER]: "냉동기",
  [ESourceSystemType.DISTRICT_HEATING]: "지역난방",
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: "지열 히트펌프",
  [ESourceSystemType.HEATPUMP]: "히트펌프",
};

export const FUEL_LABEL: Record<EFuelType, string> = {
  [EFuelType.DISTRICT_HEATING]: "지역난방",
  [EFuelType.ELECTRICITY]: "전기",
  [EFuelType.NATURAL_GAS]: "가스",
  [EFuelType.OIL]: "유류",
};

export const COMPRESSOR_LABEL: Record<ECompressorType, string> = {
  [ECompressorType.RECIPROCATING]: "왕복동",
  [ECompressorType.SCREW]: "스크류",
  [ECompressorType.TURBO]: "터보",
};

export const COOLING_TOWER_CONTROL_LABEL: Record<ECoolingTowerControlType, string> = {
  [ECoolingTowerControlType.SINGLE_SPEED]: "단속 제어",
  [ECoolingTowerControlType.TWO_SPEED]: "2단 속도 제어",
};

export const COOLING_TOWER_TYPE_LABEL: Record<ECoolingTowerType, string> = {
  [ECoolingTowerType.CLOSED]: "폐쇄형 건식",
  [ECoolingTowerType.OPEN]: "개방형 습식",
};
