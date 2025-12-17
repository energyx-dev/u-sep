import { z } from "zod";

export const fenestrationConstructionAddSchema = z
  .object({
    // 이름
    name: z.string().min(1).max(50),

    // 투명 여부
    is_transparent: z.boolean(),

    // 열관류율(U-value)
    u: z.number().gt(0),

    // 태양열 취득계수(SHGC)
    g: z.number().gt(0).lte(1).optional(),
  })
  .refine(
    (data) => {
      if (data.is_transparent) {
        return data.g !== undefined;
      }
      return true;
    },
    {
      message: "구조체가 투명인 경우 태양열 취득계수(SHGC)는 필수입니다.",
      path: ["g"],
    },
  );

export const fenestrationConstructionEngineAndGuiSchema = z.object({
  g: z.number().gt(0).lte(1).optional(),
  id: z.string(),
  is_transparent: z.boolean(),
  name: z.string().min(1).max(50),
  u: z.number().gt(0),
});

export type TFenestrationConstructionAddSchema = z.infer<typeof fenestrationConstructionAddSchema>;

export type TFenestrationConstructionEngineAndGuiSchema = z.infer<
  typeof fenestrationConstructionEngineAndGuiSchema
>;
