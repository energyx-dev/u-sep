import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";

const columnHelper = createColumnHelper<TMaterialEngineAndGuiSchema>();

export const MATERIAL_COLUMNS = [
  columnHelper.accessor((row) => row.name, {
    header: "이름",
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.elements.material.name },
    size: 100,
  }),
  columnHelper.accessor((row) => row.conductivity, {
    header: "열전도율(W/m·K)",
    id: "conductivity",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.elements.material.conductivity,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.density, {
    header: "밀도(kg/m³)",
    id: "density",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.elements.material.density,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.specific_heat, {
    header: "비열(J/kg·K)",
    id: "specific_heat",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.elements.material.specific_heat,
    },
    size: 100,
  }),
];
