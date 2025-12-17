import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const surfaceConstructionErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    material_0: VALIDATION_ERROR_MESSAGES.elements.surface_construction.layers.material_id,
    name: VALIDATION_ERROR_MESSAGES.elements.surface_construction.name,
    thickness_0: VALIDATION_ERROR_MESSAGES.elements.surface_construction.layers.thickness,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
