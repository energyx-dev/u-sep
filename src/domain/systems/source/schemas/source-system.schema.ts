import { z } from "zod";

import {
  ECompressorType,
  ECoolingTowerControlType,
  ECoolingTowerType,
  EFuelType,
  ESourceSystemType,
} from "@/domain/systems/source/constants/sourceSystem.enums";

// 공통 스키마
export const sourceSystemSchema = z.object({
  boiler_efficiency: z.number().gt(0).lt(100).optional(), // 연동 보일러 효율, fuel_type 이 district_heating 이면 안됨
  capacity_cooling: z.number().gt(0).optional(), // 냉방 용량 (W)
  capacity_heating: z.number().gt(0).optional(), // 난방 용량 (W)
  compressor_type: z.nativeEnum(ECompressorType).optional(), //압축기 방식
  coolingtower_capacity: z.number().gt(0).optional(), // 냉각탑 용량 (W)
  coolingtower_control: z.nativeEnum(ECoolingTowerControlType).optional(), // 냉각탑 제어 방법
  coolingtower_type: z.nativeEnum(ECoolingTowerType).optional(), // 냉각탑 종류
  cop_cooling: z.number().gt(0).optional(), // 냉방 효율
  cop_heating: z.number().gt(0).optional(), // 난방 효율
  efficiency: z.number().gt(0).lt(100).optional(), // 효율 (0~100)
  fuel_type: z.nativeEnum(EFuelType),
  hotwater_supply: z.boolean().optional(),
  id: z.string(),
  name: z.string().min(1).max(50),
});

//
// gui
//
// 흡수식 냉동기 스키마
export const absorptionChillerGuiSchema = sourceSystemSchema.pick({
  boiler_efficiency: true,
  capacity_cooling: true,
  cop_cooling: true,
  fuel_type: true,
  id: true,
  name: true,
});

// 보일러 스키마
export const boilerGuiSchema = sourceSystemSchema.pick({
  capacity_heating: true,
  efficiency: true,
  fuel_type: true,
  hotwater_supply: true,
  id: true,
  name: true,
});

// 냉동기 스키마
export const chillerGuiSchema = sourceSystemSchema.pick({
  capacity_cooling: true,
  compressor_type: true,
  coolingtower_capacity: true,
  coolingtower_control: true,
  coolingtower_type: true,
  cop_cooling: true,
  fuel_type: true,
  id: true,
  name: true,
});

// 지역난방 스키마
export const districtHeatingGuiSchema = sourceSystemSchema.pick({
  hotwater_supply: true,
  id: true,
  name: true,
});

// 지열 히트펌프 스키마
export const geothermalHeatpumpGuiSchema = sourceSystemSchema.pick({
  capacity_cooling: true,
  capacity_heating: true,
  cop_cooling: true,
  cop_heating: true,
  fuel_type: true,
  id: true,
  name: true,
});

// 히트펌프 스키마
export const heatpumpGuiSchema = sourceSystemSchema.pick({
  capacity_cooling: true,
  capacity_heating: true,
  cop_cooling: true,
  cop_heating: true,
  fuel_type: true,
  id: true,
  name: true,
});

export const sourceSystemGuiSchema = z.object({
  [ESourceSystemType.ABSORPTION_CHILLER]: z.array(absorptionChillerGuiSchema),
  [ESourceSystemType.BOILER]: z.array(boilerGuiSchema),
  [ESourceSystemType.CHILLER]: z.array(chillerGuiSchema),
  [ESourceSystemType.DISTRICT_HEATING]: z.array(districtHeatingGuiSchema),
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: z.array(geothermalHeatpumpGuiSchema),
  [ESourceSystemType.HEATPUMP]: z.array(heatpumpGuiSchema),
});

export type TSourceSystemGuiSchema = z.infer<typeof sourceSystemGuiSchema>;

//
// engine
//
// 흡수식 냉동기 스키마
const absorptionChillerEngineSchema = absorptionChillerGuiSchema.extend({
  type: z.literal(ESourceSystemType.ABSORPTION_CHILLER),
});

// 보일러 스키마
const boilerEngineSchema = boilerGuiSchema.extend({
  type: z.literal(ESourceSystemType.BOILER),
});

export type TBoilerEngineSchema = z.infer<typeof boilerEngineSchema>;

// 냉동기 스키마
const chillerEngineSchema = chillerGuiSchema.extend({
  type: z.literal(ESourceSystemType.CHILLER),
});

// 지역난방 스키마
const districtHeatingEngineSchema = districtHeatingGuiSchema.extend({
  type: z.literal(ESourceSystemType.DISTRICT_HEATING),
});

// 지열 히트펌프 스키마
const geothermalHeatpumpEngineSchema = geothermalHeatpumpGuiSchema.extend({
  type: z.literal(ESourceSystemType.GEOTHERMAL_HEATPUMP),
});

// 히트펌프 스키마
const heatpumpEngineSchema = heatpumpGuiSchema.extend({
  type: z.literal(ESourceSystemType.HEATPUMP),
});

export const sourceSystemEngineSchema = z.array(
  z.union([
    absorptionChillerEngineSchema,
    boilerEngineSchema,
    chillerEngineSchema,
    districtHeatingEngineSchema,
    geothermalHeatpumpEngineSchema,
    heatpumpEngineSchema,
  ]),
);
