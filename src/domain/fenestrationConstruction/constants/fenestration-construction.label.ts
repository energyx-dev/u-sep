export const FENESTRATION_CONSTRUCTION_LABEL = {
  g: { label: "태양열 취득계수[SHGC]" },
  id: { label: "ID" },
  is_transparent: { label: "투명 여부" },
  name: { label: "이름" },
  u: { label: "열관류율(W/m²·K)" },
} as const;

export const getFenestrationConstructionTableLabel = (
  key: keyof typeof FENESTRATION_CONSTRUCTION_LABEL,
) => {
  const label = FENESTRATION_CONSTRUCTION_LABEL[key];
  if ("unit" in label) {
    return `${label.label} [${label.unit}]`;
  }
  return label.label;
};
