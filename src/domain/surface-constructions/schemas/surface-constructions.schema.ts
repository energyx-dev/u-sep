import { z } from "zod";

import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";

export const surfaceConstructionEngineAndGuiSchema = z.object({
  id: z.string(),
  layers: z.array(
    z.object({
      material_id: z.string(),
      thickness: z.number().gte(3),
    }),
  ),
  name: z.string().min(1).max(50),
  type: z.enum([BUILDING_SURFACE_TYPE.floor, BUILDING_SURFACE_TYPE.wall]),
});

export type TSurfaceConstructionEngineAndGuiSchema = z.infer<
  typeof surfaceConstructionEngineAndGuiSchema
>;
