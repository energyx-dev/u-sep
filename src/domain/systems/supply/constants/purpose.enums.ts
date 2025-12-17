export enum EPurpose {
  COOLING = "COOLING",
  COOLING_HEATING = "COOLING_HEATING",
  HEATING = "HEATING",
}

export const PURPOSE_LABELS: Record<EPurpose, string> = {
  [EPurpose.COOLING]: "냉방",
  [EPurpose.COOLING_HEATING]: "냉난방",
  [EPurpose.HEATING]: "난방",
};
