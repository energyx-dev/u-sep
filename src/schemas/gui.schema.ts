import { z } from "zod";

import { buildingGUISchema } from "@/domain/basic-info/schemas/building.schema";
import { versionSchema } from "@/domain/building-geometry/schemas/version-name.schema";
import { fenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { fenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import { materialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
import { floorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { surfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { lightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { lightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { photovoltaicEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { sourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { supplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { ventilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import { templateReferenceSchema } from "@/types/template.types";

const buildingGeometryGuiSchema = z.object({
  buildingFloors: z.array(floorGuiSchema),
  photovoltaic_systems: z.array(templateReferenceSchema),
  version: versionSchema,
});

export type TBuildingGeometryGuiSchema = z.infer<typeof buildingGeometryGuiSchema>;

// GUI 스키마
// Zustand Store 타입 지정에 사용
// Zustand 데이터 저장, 파일 열기 등 GUI 유효성 검사에 사용 가능할 듯
export const guiSchema = z.object({
  // 리모델링 전/후
  afterBuilding: buildingGeometryGuiSchema,
  beforeBuilding: buildingGeometryGuiSchema,
  // 공통
  // daySchedules: TDayScState,
  buildingInfo: buildingGUISchema,
  fenestrationConstructions: z.array(fenestrationConstructionEngineAndGuiSchema),
  fenestrations: z.array(fenestrationEngineAndGuiSchema),
  lightning: z.array(lightningGuiSchema),
  lightningDensity: z.array(lightningDensityGuiSchema),
  materials: z.array(materialEngineAndGuiSchema),
  photovoltaicSystems: z.array(photovoltaicEngineAndGuiSchema),
  sourceSystems: sourceSystemGuiSchema,
  supplySystems: supplySystemGuiSchema,
  surfaceConstructions: z.array(surfaceConstructionEngineAndGuiSchema),
  ventilationSystems: z.array(ventilationEngineAndGuiSchema),
});

export type TGuiSchema = z.infer<typeof guiSchema>;
