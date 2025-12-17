import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const fenestrationErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    area: VALIDATION_ERROR_MESSAGES.elements.fenestration.area,
    blind: VALIDATION_ERROR_MESSAGES.elements.fenestration.blind,
    construction_id: VALIDATION_ERROR_MESSAGES.elements.fenestration.construction_id,
    name: VALIDATION_ERROR_MESSAGES.elements.fenestration.name,
    type: VALIDATION_ERROR_MESSAGES.elements.fenestration.type,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
