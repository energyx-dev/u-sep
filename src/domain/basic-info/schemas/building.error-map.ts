import { z } from "zod";

import { VALIDATION_ERROR_MESSAGES } from "@/constants/validation-error-messages";

const DEFAULT_MESSAGE = "입력값을 확인해주세요.";

export const buildingErrorMap: z.ZodErrorMap = (issue) => {
  const field = String(issue.path?.[0] ?? "");

  const map: Record<string, string> = {
    addressDistrict: VALIDATION_ERROR_MESSAGES.building_info.addressDistrict,
    addressRegion: VALIDATION_ERROR_MESSAGES.building_info.addressRegion,
    detailAddress: VALIDATION_ERROR_MESSAGES.building_info.detailAddress,
    name: VALIDATION_ERROR_MESSAGES.building_info.name,
    north_axis: VALIDATION_ERROR_MESSAGES.building_info.north_axis,
    vintage: VALIDATION_ERROR_MESSAGES.building_info.vintage,
  };

  return { message: map[field] ?? DEFAULT_MESSAGE };
};
