import { z } from "zod";

export const templateReferenceSchema = z.object({
  count: z.number(),
  id: z.string(),
});

export type TTemplateReference = z.infer<typeof templateReferenceSchema>;
