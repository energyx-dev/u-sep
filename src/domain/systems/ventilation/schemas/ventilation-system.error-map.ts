import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const ventilationSystemErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    efficiency_cooling: VALIDATION_ERROR_MESSAGES.systems.ventilation_system.efficiency_cooling,
    efficiency_heating: VALIDATION_ERROR_MESSAGES.systems.ventilation_system.efficiency_heating,
    name: VALIDATION_ERROR_MESSAGES.systems.ventilation_system.name,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
