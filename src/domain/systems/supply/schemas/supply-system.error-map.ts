import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const supplySystemErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    capacity_cooling: VALIDATION_ERROR_MESSAGES.systems.supply_system.capacity_cooling,
    capacity_heating: VALIDATION_ERROR_MESSAGES.systems.supply_system.capacity_heating,
    cop_cooling: VALIDATION_ERROR_MESSAGES.systems.supply_system.cop_cooling,
    name: VALIDATION_ERROR_MESSAGES.systems.supply_system.name,
    purpose: VALIDATION_ERROR_MESSAGES.systems.supply_system.purpose,
    source_system_id: VALIDATION_ERROR_MESSAGES.systems.supply_system.source_system_id,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
