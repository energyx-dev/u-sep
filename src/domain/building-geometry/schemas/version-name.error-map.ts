import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const versionErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    name: VALIDATION_ERROR_MESSAGES.shape_info.version.name,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
