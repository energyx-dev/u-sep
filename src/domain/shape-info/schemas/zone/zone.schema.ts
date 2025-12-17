import { z } from "zod";

import {
  surfaceEngineSchema,
  surfaceGuiSchema,
} from "@/domain/shape-info/schemas/surface/surface.schema";
import { ZONE_PROFILE_TYPE } from "@/domain/shape-info/schemas/zone/zone.enum";
import { lightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { lightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { REQUIRED_MESSAGE } from "@/lib/message-helper";

const zoneSchema = z.object({
  density: z.array(lightningDensityGuiSchema).optional(),
  height: z.union([z.number().gt(0), z.undefined().refine(() => false)]),
  id: z.string({ required_error: REQUIRED_MESSAGE }),
  infiltration: z.union([z.number().gte(0), z.undefined().refine(() => false)]),
  light_density: z.union([z.number().gte(0), z.undefined().refine(() => false)]),
  lightning: z.array(lightningGuiSchema).optional(),
  name: z.string().min(1).max(50),
  profile: z.enum(Object.keys(ZONE_PROFILE_TYPE) as [string, ...string[]]),
  profile_id: z.string().optional(),
  supply_system_cooling_id: z.string().nullable().optional(),
  supply_system_heating_id: z.string().nullable().optional(),
  ventilation_system_id: z.string().nullable().optional(),
});

export const zoneEngineSchema = zoneSchema.extend({
  surfaces: z.array(surfaceEngineSchema),
});

export const zoneGuiSchema = zoneSchema.extend({
  surfaces: z.array(surfaceGuiSchema),
});

export type TZoneEngineSchema = z.infer<typeof zoneEngineSchema>;

export type TZoneGuiSchema = z.infer<typeof zoneGuiSchema>;
