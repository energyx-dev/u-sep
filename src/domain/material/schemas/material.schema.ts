import { z } from "zod";

// 공통 스키마
export const materialEngineAndGuiSchema = z.object({
  conductivity: z.number().gt(0), // 열전달율 [W/mK]
  density: z.number().gt(0), // 밀도 [kg/m³]
  id: z.string(),
  name: z.string().min(1).max(50),
  specific_heat: z.number().gt(100), // 비열 [J/kgK]
});

export const materialGuiAddSchema = materialEngineAndGuiSchema.omit({ id: true });

export type TMaterialEngineAndGuiSchema = z.infer<typeof materialEngineAndGuiSchema>;
