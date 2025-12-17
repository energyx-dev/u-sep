import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { VENTILATION_SYSTEM_LABEL } from "@/domain/systems/ventilation/constants/ventilation.label";
import { TVentilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";

const columnHelper = createColumnHelper<TVentilationEngineAndGuiSchema>();

export const VENTILATION_SYSTEM_COLUMNS = [
  columnHelper.accessor((row) => row.name, {
    header: "이름",
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.ventilation_system.name },
    size: 100,
  }),
  columnHelper.accessor((row) => row.efficiency_heating, {
    header: VENTILATION_SYSTEM_LABEL.efficiency_heating,
    id: "efficiency_heating",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.ventilation_system.efficiency_heating,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.efficiency_cooling, {
    header: VENTILATION_SYSTEM_LABEL.efficiency_cooling,
    id: "efficiency_cooling",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.ventilation_system.efficiency_cooling,
    },
    size: 100,
  }),
];
