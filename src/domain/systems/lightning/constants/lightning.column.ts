import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";

const columnHelper = createColumnHelper<TLightningGuiSchema>();

export const LIGHTNING_COLUMNS = [
  columnHelper.accessor((row) => row.name, {
    header: "이름",
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.lightning.name },
    size: 100,
  }),
  columnHelper.accessor((row) => row.electric_consumption, {
    cell: ({ getValue, row }) => {
      const value = getValue<"-" | number>();
      if (row.original.id === "manual-input") {
        return value === 0 || value === "-" ? "-" : value;
      }
      return value;
    },
    header: "소비 전력(W)",
    id: "electric_consumption",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.lightning.electric_consumption,
    },
    size: 100,
  }),
];
