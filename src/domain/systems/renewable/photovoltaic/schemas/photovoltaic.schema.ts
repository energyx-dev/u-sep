import { z } from "zod";

// 추가용 스키마 (id 제외)
export const photovoltaicAddSchema = z.object({
  name: z.string().min(1).max(50),

  // 면적 m²
  area: z.number().gt(0),

  // 효율
  efficiency: z.number().gt(0).lt(100),

  // 향
  azimuth: z.number().gte(0).lt(360),

  // 기울기
  tilt: z.number().gte(0).lte(90),
});

// 저장용 스키마 (id 포함)
export const photovoltaicEngineAndGuiSchema = photovoltaicAddSchema.extend({
  id: z.string(),
});

export type TPhotovoltaicSystemEngineAndGuiSchema = z.infer<typeof photovoltaicEngineAndGuiSchema>;
