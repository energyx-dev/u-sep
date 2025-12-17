import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const zoneErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    height: VALIDATION_ERROR_MESSAGES.shape_info.zone.height,
    infiltration: VALIDATION_ERROR_MESSAGES.shape_info.zone.infiltration,
    light_density: VALIDATION_ERROR_MESSAGES.shape_info.zone.lightning,
    name: VALIDATION_ERROR_MESSAGES.shape_info.zone.name,
    profile: VALIDATION_ERROR_MESSAGES.shape_info.zone.profile,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
