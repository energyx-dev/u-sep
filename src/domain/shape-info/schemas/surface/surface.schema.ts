import { z } from "zod";

import { fenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import {
  BOUNDARY_CONDITION_TYPE,
  BUILDING_SURFACE_TYPE,
} from "@/domain/shape-info/schemas/surface/surface.enum";
import { getSurfaceFieldValidationRule } from "@/domain/shape-info/schemas/surface/surface.validation-rules";
import { ERROR_MESSAGES, STRING_MESSAGE } from "@/lib/message-helper";

const surfaceSchema = z.object({
  adjacent_zone_id: z.string().optional(),
  area: z.union([z.number().gt(0), z.undefined().refine(() => false)]),
  azimuth: z.number().min(0).max(359.99).optional(),
  boundary_condition: z.enum(Object.keys(BOUNDARY_CONDITION_TYPE) as [string, ...string[]]),
  construction_id: z
    .string({ required_error: STRING_MESSAGE })
    .min(1, ERROR_MESSAGES.requiredSelectField("면 구조체")),
  coolroof_reflectance: z.number().min(0).max(100).nullable().optional(),
  fenestrations: z.array(fenestrationEngineAndGuiSchema),
  id: z.string({ required_error: STRING_MESSAGE }),
  name: z.string().min(1).max(50),
  type: z.nativeEnum(BUILDING_SURFACE_TYPE),
  // GUI 전용 필드
  adjacent_from: z.string().optional(), // 인접존 확인을 위한 FE에서만 사용되는 필드
  adjacent_surface_id: z.string().optional(), // 인접면 확인을 위한 필드
  isGenerated: z.boolean().optional(), // 존 직접 연결로 생성 된 인접면 (FE에서만 사용하는 필드)
});

export const surfaceEngineSchema = surfaceSchema.omit({
  adjacent_from: true,
  adjacent_surface_id: true,
  isGenerated: true,
});

export const surfaceGuiSchema = surfaceSchema.superRefine((surface, ctx) => {
  if (getSurfaceFieldValidationRule({ fieldName: "azimuth", surface })) {
    if (surface.azimuth === undefined || surface.azimuth === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["azimuth"],
      });
    }
  }

  if (getSurfaceFieldValidationRule({ fieldName: "coolroof_reflectance", surface })) {
    if (surface.coolroof_reflectance === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coolroof_reflectance"],
      });
    }
  }

  if (getSurfaceFieldValidationRule({ fieldName: "adjacent_zone_id", surface })) {
    if (!surface.adjacent_zone_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["adjacent_zone_id"],
      });
    }
  }
});

export type TSurfaceEngineSchema = z.infer<typeof surfaceEngineSchema>;
export type TSurfaceGuiSchema = z.infer<typeof surfaceGuiSchema>;
