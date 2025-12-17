import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { getPhotovoltaicTableLabel } from "@/domain/systems/renewable/photovoltaic/utils/photovoltaic.label";

const columnHelper = createColumnHelper<TPhotovoltaicSystemEngineAndGuiSchema>();

export const PHOTOVOLTAIC_SYSTEM_COLUMNS = [
  columnHelper.accessor((row) => row.name, {
    header: getPhotovoltaicTableLabel("name"),
    id: "name",
    meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.photovoltaic.name },
    size: 100,
  }),
  columnHelper.accessor((row) => row.area, {
    header: getPhotovoltaicTableLabel("area"),
    id: "area",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.photovoltaic.area,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.efficiency, {
    header: getPhotovoltaicTableLabel("efficiency"),
    id: "efficiency",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.photovoltaic.efficiency,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.azimuth, {
    header: getPhotovoltaicTableLabel("azimuth"),
    id: "azimuth",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.photovoltaic.azimuth,
    },
    size: 100,
  }),
  columnHelper.accessor((row) => row.tilt, {
    header: getPhotovoltaicTableLabel("tilt"),
    id: "tilt",
    meta: {
      inputType: "number",
      isRequired: true,
      placeholder: PLACEHOLDERS.systems.photovoltaic.tilt,
    },
    size: 100,
  }),
];
