import { z } from "zod";

import { zoneEngineSchema, zoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";

const floorSchema = z.object({
  floor_id: z.string(),
  floor_name: z.string().min(1).max(50),
  floor_number: z.number(),
});

export const floorEngineSchema = floorSchema.pick({ floor_number: true }).extend({
  zones: z.array(zoneEngineSchema),
});

export const floorGuiSchema = floorSchema.extend({
  zones: z.array(zoneGuiSchema),
});

export type TFloorEngineSchema = z.infer<typeof floorEngineSchema>;

export type TFloorGuiSchema = z.infer<typeof floorGuiSchema>;
