import { z } from "zod";

import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import {
  absorptionChillerGuiSchema,
  boilerGuiSchema,
  chillerGuiSchema,
  districtHeatingGuiSchema,
  geothermalHeatpumpGuiSchema,
  heatpumpGuiSchema,
} from "@/domain/systems/source/schemas/source-system.schema";

// gui 추가 기능 스키마
//
// 흡수식 냉동기
//
const absorptionChillerGuiAddSchema = absorptionChillerGuiSchema.omit({
  id: true,
});

export type TAbsorptionChillerGuiAddSchema = z.infer<typeof absorptionChillerGuiAddSchema>;

//
// 보일러
//
const boilerGuiAddSchema = boilerGuiSchema.omit({
  id: true,
});

export type TBoilerGuiAddSchema = z.infer<typeof boilerGuiAddSchema>;

//
// 냉동기
//
const chillerGuiAddSchema = chillerGuiSchema.omit({
  id: true,
});

export type TChillerGuiAddSchema = z.infer<typeof chillerGuiAddSchema>;

//
// 지역난방
//
const districtHeatingGuiAddSchema = districtHeatingGuiSchema.omit({
  id: true,
});

export type TDistrictHeatingGuiAddSchema = z.infer<typeof districtHeatingGuiAddSchema>;

//
// 지열 히트펌프
//
const geothermalHeatpumpGuiAddSchema = geothermalHeatpumpGuiSchema.omit({
  id: true,
});

export type TGeothermalHeatpumpGuiAddSchema = z.infer<typeof geothermalHeatpumpGuiAddSchema>;

//
// 히트펌프
//
const heatpumpGuiAddSchema = heatpumpGuiSchema.omit({
  id: true,
});

export type THeatpumpGuiAddSchema = z.infer<typeof heatpumpGuiAddSchema>;

//
// 생산 시스템
//
export const sourceSystemGuiAddSchema = {
  [ESourceSystemType.ABSORPTION_CHILLER]: absorptionChillerGuiAddSchema,
  [ESourceSystemType.BOILER]: boilerGuiAddSchema,
  [ESourceSystemType.CHILLER]: chillerGuiAddSchema,
  [ESourceSystemType.DISTRICT_HEATING]: districtHeatingGuiAddSchema,
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: geothermalHeatpumpGuiAddSchema,
  [ESourceSystemType.HEATPUMP]: heatpumpGuiAddSchema,
};
