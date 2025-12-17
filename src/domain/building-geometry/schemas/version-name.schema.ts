import { z } from "zod";

export const versionSchema = z.object({
  name: z.string().min(1).max(50),
});

export type TVersionGuiSchema = z.infer<typeof versionSchema>;
