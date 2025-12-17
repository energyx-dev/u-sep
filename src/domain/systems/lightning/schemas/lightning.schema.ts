import { z } from "zod";

export const lightningGuiSchema = z.object({
  count: z.number().optional(),
  electric_consumption: z.number().gt(0),
  id: z.string(),
  name: z.string().min(1).max(50),
});

export const lightningAddSchema = lightningGuiSchema.omit({ count: true, id: true });
export type TLightningGuiSchema = z.infer<typeof lightningGuiSchema>;
