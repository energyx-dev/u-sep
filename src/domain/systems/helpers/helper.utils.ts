import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";

// 공급 설비(1) <-> 생산 설비 연결 관계(N)
export const getSourceSystemTypesBySupplySystem = (
  supplySystemType: ESupplySystemType,
  purpose?: EPurpose,
): ESourceSystemType[] => {
  if (!purpose) return [];

  switch (supplySystemType) {
    case ESupplySystemType.AIR_HANDLING_UNIT: {
      switch (purpose) {
        case EPurpose.COOLING_HEATING:
          return [ESourceSystemType.HEATPUMP, ESourceSystemType.GEOTHERMAL_HEATPUMP];
        default:
          return [];
      }
    }
    case ESupplySystemType.FAN_COIL_UNIT: {
      switch (purpose) {
        case EPurpose.COOLING:
          return [ESourceSystemType.CHILLER, ESourceSystemType.ABSORPTION_CHILLER];
        case EPurpose.HEATING:
          return [ESourceSystemType.BOILER, ESourceSystemType.DISTRICT_HEATING];
        default:
          return [];
      }
    }
    case ESupplySystemType.ELECTRIC_RADIATOR:
      return [];
    case ESupplySystemType.PACKAGED_AIR_CONDITIONER:
      return [];
    case ESupplySystemType.RADIANT_FLOOR:
      switch (purpose) {
        case EPurpose.COOLING:
          return [];
        case EPurpose.COOLING_HEATING:
          return [];
        case EPurpose.HEATING:
          return [ESourceSystemType.BOILER, ESourceSystemType.DISTRICT_HEATING];
        default:
          return [];
      }
    case ESupplySystemType.RADIATOR:
      switch (purpose) {
        case EPurpose.COOLING:
          return [];
        case EPurpose.COOLING_HEATING:
          return [];
        case EPurpose.HEATING:
          return [ESourceSystemType.BOILER, ESourceSystemType.DISTRICT_HEATING];
        default:
          return [];
      }
    default:
      return [];
  }
};

export const getCoolingOrHeatingTypeBySupplySystemType = (
  supplySystemType: ESupplySystemType,
): EPurpose[] => {
  switch (supplySystemType) {
    case ESupplySystemType.AIR_HANDLING_UNIT:
      return [EPurpose.COOLING_HEATING];
    case ESupplySystemType.ELECTRIC_RADIATOR:
      return [EPurpose.HEATING];
    case ESupplySystemType.FAN_COIL_UNIT:
      return [EPurpose.COOLING, EPurpose.HEATING];
    case ESupplySystemType.PACKAGED_AIR_CONDITIONER:
      return [EPurpose.COOLING];
    case ESupplySystemType.RADIANT_FLOOR:
      return [EPurpose.HEATING];
    case ESupplySystemType.RADIATOR:
      return [EPurpose.HEATING];
    default:
      return [];
  }
};
