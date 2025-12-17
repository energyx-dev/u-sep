import { z } from "zod";

import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";

const baseFields = {
  id: z.string(),
  name: z.string().min(1).max(50),
  purpose: z.nativeEnum(EPurpose).nullable(),
};

const fields = {
  capacity_cooling: z.number().gt(0).optional(), // 냉방 용량 (W)
  capacity_heating: z.number().gt(0).optional(), // 난방 용량 (W)
  cop_cooling: z.number().gt(0).optional(), // 냉방 COP
  source_system_id: z.string(), // 생산 설비
};

export const airHandlingUnitGuiSchema = z.object({
  ...baseFields,
  source_system_id: fields.source_system_id,
});

export const electricRadiatorGuiSchema = z.object({
  ...baseFields,
  capacity_heating: fields.capacity_heating,
});

export const packagedAirConditionerGuiSchema = z.object({
  ...baseFields,
  capacity_cooling: fields.capacity_cooling,
  cop_cooling: fields.cop_cooling,
});

export const radiantFloorGuiSchema = z.object({
  ...baseFields,
  source_system_id: fields.source_system_id,
});

export const radiatorGuiSchema = z.object({
  ...baseFields,
  capacity_heating: fields.capacity_heating,
  source_system_id: fields.source_system_id,
});

export const fanCoilUnitGuiSchema = z.object({
  ...baseFields,
  source_system_id: fields.source_system_id,
});

export const supplySystemGuiSchema = z.object({
  [ESupplySystemType.AIR_HANDLING_UNIT]: z.array(airHandlingUnitGuiSchema),
  [ESupplySystemType.ELECTRIC_RADIATOR]: z.array(electricRadiatorGuiSchema),
  [ESupplySystemType.FAN_COIL_UNIT]: z.array(fanCoilUnitGuiSchema),
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: z.array(packagedAirConditionerGuiSchema),
  [ESupplySystemType.RADIANT_FLOOR]: z.array(radiantFloorGuiSchema),
  [ESupplySystemType.RADIATOR]: z.array(radiatorGuiSchema),
});

export type TSupplySystemGuiSchema = z.infer<typeof supplySystemGuiSchema>;

const makeEngineSchema = <T extends ESupplySystemType, S extends z.ZodRawShape>(
  schema: z.ZodObject<S>,
  type: T,
) => schema.extend({ type: z.literal(type) });

export const supplySystemEngineSchema = z.array(
  z.union([
    makeEngineSchema(airHandlingUnitGuiSchema, ESupplySystemType.AIR_HANDLING_UNIT),
    makeEngineSchema(electricRadiatorGuiSchema, ESupplySystemType.ELECTRIC_RADIATOR),
    makeEngineSchema(fanCoilUnitGuiSchema, ESupplySystemType.FAN_COIL_UNIT),
    makeEngineSchema(packagedAirConditionerGuiSchema, ESupplySystemType.PACKAGED_AIR_CONDITIONER),
    makeEngineSchema(radiantFloorGuiSchema, ESupplySystemType.RADIANT_FLOOR),
    makeEngineSchema(radiatorGuiSchema, ESupplySystemType.RADIATOR),
  ]),
);

export type TSupplySystemEngineSchema = z.infer<typeof supplySystemEngineSchema>;
