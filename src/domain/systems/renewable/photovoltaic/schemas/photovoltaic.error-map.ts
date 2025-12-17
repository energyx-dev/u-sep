import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const photovoltaicErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    area: VALIDATION_ERROR_MESSAGES.systems.photovoltaic.area,
    azimuth: VALIDATION_ERROR_MESSAGES.systems.photovoltaic.azimuth,
    efficiency: VALIDATION_ERROR_MESSAGES.systems.photovoltaic.efficiency,
    name: VALIDATION_ERROR_MESSAGES.systems.photovoltaic.name,
    tilt: VALIDATION_ERROR_MESSAGES.systems.photovoltaic.tilt,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
