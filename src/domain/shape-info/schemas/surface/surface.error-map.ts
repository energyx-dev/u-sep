import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const surfaceErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    adjacent_zone_id: VALIDATION_ERROR_MESSAGES.shape_info.surface.adjacent_zone_id,
    area: VALIDATION_ERROR_MESSAGES.shape_info.surface.area,
    azimuth: VALIDATION_ERROR_MESSAGES.shape_info.surface.azimuth,
    boundary_condition: VALIDATION_ERROR_MESSAGES.shape_info.surface.boundary_condition,
    coolroof_reflectance: VALIDATION_ERROR_MESSAGES.shape_info.surface.coolroof_reflectance,
    name: VALIDATION_ERROR_MESSAGES.shape_info.surface.name,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
