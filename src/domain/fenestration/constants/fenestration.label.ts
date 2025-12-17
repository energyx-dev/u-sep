export const FENESTRATION_LABEL = {
  area: { label: "면적", unit: "m²" },
  blind: { label: "블라인드" },
  construction_id: { label: "개구부 구조체" },
  id: { label: "ID" },
  name: { label: "이름" },
  type: { label: "종류" },
} as const;

export const getFenestrationTableLabel = (key: keyof typeof FENESTRATION_LABEL) => {
  const label = FENESTRATION_LABEL[key];
  if ("unit" in label) {
    return `${label.label}(${label.unit})`;
  }
  return label.label;
};
