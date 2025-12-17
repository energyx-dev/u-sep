import { z } from "zod";

import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import {
  airHandlingUnitGuiSchema,
  electricRadiatorGuiSchema,
  fanCoilUnitGuiSchema,
  packagedAirConditionerGuiSchema,
  radiantFloorGuiSchema,
  radiatorGuiSchema,
} from "@/domain/systems/supply/schemas/supply-system.schema";

// gui 추가 기능 스키마
//
// 공조기
//
const airHandlingUnitGuiAddSchema = airHandlingUnitGuiSchema.omit({
  id: true,
});

export type TAirHandlingUnitGuiAddSchema = z.infer<typeof airHandlingUnitGuiAddSchema>;

//
// 전기 라디에이터
//
const electricRadiatorGuiAddSchema = electricRadiatorGuiSchema.omit({
  id: true,
});

export type TElectricRadiatorGuiAddSchema = z.infer<typeof electricRadiatorGuiAddSchema>;

//
// 패키지 에어컨
//
const packagedAirConditionerGuiAddSchema = packagedAirConditionerGuiSchema.omit({
  id: true,
});

export type TPackagedAirConditionerGuiAddSchema = z.infer<
  typeof packagedAirConditionerGuiAddSchema
>;
//
// 온돌/복사 바닥
//
const radiantFloorGuiAddSchema = radiantFloorGuiSchema.omit({
  id: true,
});

export type TRadiantFloorGuiAddSchema = z.infer<typeof radiantFloorGuiAddSchema>;

//
// 라디에이터
//
const radiatorGuiAddSchema = radiatorGuiSchema.omit({
  id: true,
});

export type TRadiatorGuiAddSchema = z.infer<typeof radiatorGuiAddSchema>;

//
// 팬코일유닛
//
const fanCoilUnitGuiAddSchema = fanCoilUnitGuiSchema.omit({
  id: true,
});

export type TFanCoilUnitGuiAddSchema = z.infer<typeof fanCoilUnitGuiAddSchema>;

export const supplySystemGuiAddSchema = {
  [ESupplySystemType.AIR_HANDLING_UNIT]: airHandlingUnitGuiAddSchema,
  [ESupplySystemType.ELECTRIC_RADIATOR]: electricRadiatorGuiAddSchema,
  [ESupplySystemType.FAN_COIL_UNIT]: fanCoilUnitGuiAddSchema,
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: packagedAirConditionerGuiAddSchema,
  [ESupplySystemType.RADIANT_FLOOR]: radiantFloorGuiAddSchema,
  [ESupplySystemType.RADIATOR]: radiatorGuiAddSchema,
};
