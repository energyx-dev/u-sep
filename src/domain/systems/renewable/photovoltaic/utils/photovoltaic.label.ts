export const PHOTOVOLTAIC_SYSTEM_LABEL = {
  area: { label: "(BI)PV패널 면적", unit: "m²" },
  azimuth: { label: "(BI)PV패널 방위각", unit: "°" },
  efficiency: { label: "(BI)PV패널 효율", unit: "%" },
  id: { label: "id" },
  name: { label: "이름" },
  tilt: { label: "(BI)PV패널 경사각", unit: "°" },
} as const satisfies Record<string, { label: string; unit?: string }>;

export const getPhotovoltaicTableLabel = (key: keyof typeof PHOTOVOLTAIC_SYSTEM_LABEL) => {
  const label = PHOTOVOLTAIC_SYSTEM_LABEL[key];
  if ("unit" in PHOTOVOLTAIC_SYSTEM_LABEL[key]) {
    return `${label.label}(${PHOTOVOLTAIC_SYSTEM_LABEL[key].unit})`;
  }

  return label.label;
};
