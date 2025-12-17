import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const fenestrationConstructionErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    g: VALIDATION_ERROR_MESSAGES.elements.fenestration_construction.g,
    is_transparent: VALIDATION_ERROR_MESSAGES.elements.fenestration_construction.is_transparent,
    name: VALIDATION_ERROR_MESSAGES.elements.fenestration_construction.name,
    u: VALIDATION_ERROR_MESSAGES.elements.fenestration_construction.u,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
