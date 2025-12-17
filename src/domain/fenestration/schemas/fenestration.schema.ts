import { z } from "zod";

import {
  EFenestrationBlind,
  EFenestrationType,
} from "@/domain/fenestration/constants/fenestration.enum";

export const fenestrationAddSchema = z.object({
  // 이름
  name: z.string().min(1).max(50),

  // 종류
  type: z.nativeEnum(EFenestrationType),

  // 면적
  area: z.number().gte(0),

  // 블라인드
  blind: z.nativeEnum(EFenestrationBlind).nullable(),

  // 개구부 구조체
  construction_id: z.string(),

  // 개수
  count: z.number().optional(),
});

export const fenestrationEngineAndGuiSchema = fenestrationAddSchema.extend({
  id: z.string(),
});

export type TFenestrationEngineAndGuiSchema = z.infer<typeof fenestrationEngineAndGuiSchema>;
