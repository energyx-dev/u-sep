import { z } from "zod";

export const lightningDensityGuiSchema = z.object({
  density: z.union([z.number().gte(0), z.undefined().refine(() => false)]),
  id: z.string(),
  name: z.string().min(1).max(50),
});

export type TLightningDensityGuiSchema = z.infer<typeof lightningDensityGuiSchema>;
