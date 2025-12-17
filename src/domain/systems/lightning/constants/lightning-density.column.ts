import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";

const columnHelper = createColumnHelper<TLightningDensityGuiSchema>();

export const LIGHTNING_DENSITY_COLUMNS = [
  columnHelper.accessor((row) => row.name, {
    header: "이름",
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.lightning.name },
    size: 100,
  }),
  columnHelper.accessor((row) => row.density, {
    header: "조명 밀도(W/㎡)",
    id: "density",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.lightning.density,
    },
    size: 100,
  }),
];
