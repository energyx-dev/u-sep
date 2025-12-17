import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const materialErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    conductivity: VALIDATION_ERROR_MESSAGES.elements.material.conductivity,
    density: VALIDATION_ERROR_MESSAGES.elements.material.density,
    name: VALIDATION_ERROR_MESSAGES.elements.material.name,
    specific_heat: VALIDATION_ERROR_MESSAGES.elements.material.specific_heat,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
