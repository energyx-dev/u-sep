import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const sourceSystemErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    boiler_efficiency: VALIDATION_ERROR_MESSAGES.systems.source_system.boiler_efficiency,
    capacity_cooling: VALIDATION_ERROR_MESSAGES.systems.source_system.capacity_cooling,
    capacity_heating: VALIDATION_ERROR_MESSAGES.systems.source_system.capacity_heating,
    compressor_type: VALIDATION_ERROR_MESSAGES.systems.source_system.compressor_type,
    coolingtower_capacity: VALIDATION_ERROR_MESSAGES.systems.source_system.coolingtower_capacity,
    coolingtower_control: VALIDATION_ERROR_MESSAGES.systems.source_system.coolingtower_control,
    coolingtower_type: VALIDATION_ERROR_MESSAGES.systems.source_system.coolingtower_type,
    cop_cooling: VALIDATION_ERROR_MESSAGES.systems.source_system.cop_cooling,
    cop_heating: VALIDATION_ERROR_MESSAGES.systems.source_system.cop_heating,
    efficiency: VALIDATION_ERROR_MESSAGES.systems.source_system.efficiency,
    fuel_type: VALIDATION_ERROR_MESSAGES.systems.source_system.fuel_type,
    hotwater_supply: VALIDATION_ERROR_MESSAGES.systems.source_system.hotwater_supply,
    name: VALIDATION_ERROR_MESSAGES.systems.source_system.name,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
