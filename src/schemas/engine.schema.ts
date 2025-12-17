import { z } from "zod";

import { buildingInfoEngineSchema } from "@/domain/basic-info/schemas/building.schema";
import { fenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import { materialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
// import {
//   profileComponentsEngineSchema,
//   profileEngineSchema,
// } from "@/domain/profile/schemas/profile-schema";
import { floorEngineSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { surfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { photovoltaicEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { sourceSystemEngineSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { supplySystemEngineSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { ventilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";

const buildingEngineSchema = buildingInfoEngineSchema.merge(
  z.object({
    floors: z.array(floorEngineSchema),
    photovoltaic_systems: z.array(photovoltaicEngineAndGuiSchema),
    source_systems: sourceSystemEngineSchema,
    supply_systems: supplySystemEngineSchema,
    ventilation_systems: z.array(ventilationEngineAndGuiSchema),
  }),
);

// Engine 스키마
// Engine Input API Request 타입 지정에 사용
// GUI -> Engine 변환 시, 검증 때 사용 가능할 듯
export const engineSchema = z.object({
  building: buildingEngineSchema,
  fenestration_constructions: z.array(fenestrationConstructionEngineAndGuiSchema),
  materials: z.array(materialEngineAndGuiSchema),
  // profile_components: profileComponentsEngineSchema,
  // profiles: z.array(profileEngineSchema),
  surface_constructions: z.array(surfaceConstructionEngineAndGuiSchema),
});

export type TEngineSchema = z.infer<typeof engineSchema>;
