import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const lightningErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    electric_consumption: VALIDATION_ERROR_MESSAGES.systems.lightning.electric_consumption,
    name: VALIDATION_ERROR_MESSAGES.systems.lightning.name,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
