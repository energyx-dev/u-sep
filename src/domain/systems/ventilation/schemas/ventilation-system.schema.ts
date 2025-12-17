import { z } from "zod";

// 추가용 스키마 (id 제외)
export const ventilationAddSchema = z.object({
  name: z.string().min(1).max(50),

  // 전열교환 냉방 효율 (0~100)
  efficiency_cooling: z.number().gt(0).lt(100),

  // 전열교환 난방 효율 (0~100)
  efficiency_heating: z.number().gt(0).lt(100),
});

// 저장용 스키마 (id 포함)
export const ventilationEngineAndGuiSchema = ventilationAddSchema.extend({
  id: z.string(),
});

export type TVentilationEngineAndGuiSchema = z.infer<typeof ventilationEngineAndGuiSchema>;
