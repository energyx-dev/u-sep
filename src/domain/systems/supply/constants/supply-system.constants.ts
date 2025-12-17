import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";

export const SUPPLY_SYSTEM_LABEL: Record<ESupplySystemType, string> = {
  [ESupplySystemType.AIR_HANDLING_UNIT]: "공조기",
  [ESupplySystemType.ELECTRIC_RADIATOR]: "전기 라디에이터",
  [ESupplySystemType.FAN_COIL_UNIT]: "팬코일유닛",
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: "패키지 에어컨",
  [ESupplySystemType.RADIANT_FLOOR]: "온돌/복사 바닥",
  [ESupplySystemType.RADIATOR]: "라디에이터",
};
