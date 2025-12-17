import { createColumnHelper } from "@tanstack/react-table";
import { isNil } from "es-toolkit";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { getFenestrationConstructionTableLabel } from "@/domain/fenestrationConstruction/constants/fenestration-construction.label";
import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";

const columnHelper = createColumnHelper<TFenestrationConstructionEngineAndGuiSchema>();

export const FENESTRATION_CONSTRUCTION_COLUMNS = [
  columnHelper.accessor("name", {
    header: getFenestrationConstructionTableLabel("name"),
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.elements.fenestration_construction.name },
    size: 100,
  }),
  columnHelper.accessor(
    (row) => (isNil(row.is_transparent) ? "" : row.is_transparent ? "투명" : "불투명"),
    {
      header: getFenestrationConstructionTableLabel("is_transparent"),
      id: "is_transparent",
      meta: {
        inputType: "boolean",
        isRequired: true,
        placeholder: PLACEHOLDERS.elements.fenestration_construction.is_transparent,
        selectOptions: [
          { label: "투명", value: true },
          { label: "불투명", value: false },
        ],
      },
      size: 100,
    },
  ),
  columnHelper.accessor("u", {
    header: getFenestrationConstructionTableLabel("u"),
    id: "u",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.elements.fenestration_construction.u,
    },
    size: 100,
  }),
  columnHelper.accessor("g", {
    header: getFenestrationConstructionTableLabel("g"),
    id: "g",
    meta: {
      disabled: ({ is_transparent }) => !is_transparent,
      inputType: "number",
      isRequired: false,
      placeholderGetter: ({ is_transparent }) =>
        is_transparent ? PLACEHOLDERS.elements.fenestration_construction.g : "",
      valueGetter: ({ is_transparent }) => (is_transparent ? undefined : ""),
    },
    size: 100,
  }),
];
