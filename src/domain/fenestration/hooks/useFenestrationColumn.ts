import { createColumnHelper } from "@tanstack/react-table";
import { sortBy } from "es-toolkit";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { TSelectOption } from "@/components/custom/select/select.types";
import { PLACEHOLDERS } from "@/constants/placeholders";
import {
  FENESTRATION_BLIND_LABEL,
  FENESTRATION_TYPE_LABEL,
} from "@/domain/fenestration/constants/fenestration.enum";
import { getFenestrationTableLabel } from "@/domain/fenestration/constants/fenestration.label";
import { getValidConstructionOptionsForType } from "@/domain/fenestration/helpers/fenestration.helpers";
import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { useFenestrationConstructionStore } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { getOptionsSortedByLabel } from "@/lib/helper";

// tanstack table column 선언부 (동적 생성)
export const useFenestrationColumn = () => {
  const { fenestration_constructions } = useFenestrationConstructionStore(
    useShallow((state) => ({ fenestration_constructions: state.fenestration_constructions })),
  );

  const getConstructionIdOptions = useCallback(
    (row: TFenestrationEngineAndGuiSchema) => {
      const options: TSelectOption[] = getValidConstructionOptionsForType({
        constructionList: fenestration_constructions,
        type: row.type,
      });

      return sortBy(options, ["label", "value"]);
    },
    [fenestration_constructions],
  );

  const blindOptions = useMemo(() => {
    return [{ label: "없음", value: null }, ...getOptionsSortedByLabel(FENESTRATION_BLIND_LABEL)];
  }, []);

  const columnHelper = createColumnHelper<TFenestrationEngineAndGuiSchema>();

  const columns = [
    columnHelper.accessor("name", {
      header: getFenestrationTableLabel("name"),
      id: "name",
      meta: { isRequired: true, placeholder: PLACEHOLDERS.elements.fenestration.name },
      size: 100,
    }),
    columnHelper.accessor((row) => (row.type ? FENESTRATION_TYPE_LABEL[row.type] : ""), {
      header: getFenestrationTableLabel("type"),
      id: "type",
      meta: {
        isRequired: true,
        placeholder: PLACEHOLDERS.elements.fenestration.type,
        selectOptions: getOptionsSortedByLabel(FENESTRATION_TYPE_LABEL),
      },
      size: 100,
    }),
    columnHelper.accessor("area", {
      header: getFenestrationTableLabel("area"),
      id: "area",
      meta: {
        inputType: "number",
        isRequired: true,
        placeholder: PLACEHOLDERS.elements.fenestration.area,
      },
      size: 100,
    }),
    columnHelper.accessor(
      (row) => (row.blind === null ? "없음" : row.blind ? FENESTRATION_BLIND_LABEL[row.blind] : ""),
      {
        header: getFenestrationTableLabel("blind"),
        id: "blind",
        meta: {
          isRequired: true,
          placeholder: PLACEHOLDERS.elements.fenestration.blind,
          selectOptions: blindOptions,
        },
        size: 100,
      },
    ),
    columnHelper.accessor(
      (row) => {
        if (!row.construction_id) return "";
        const options = getConstructionIdOptions(row);
        return options.find(({ value }) => value === row.construction_id)?.label ?? "";
      },
      {
        header: getFenestrationTableLabel("construction_id"),
        id: "construction_id",
        meta: {
          isRequired: true,
          openWithDialog: true,
          placeholder: PLACEHOLDERS.elements.fenestration.construction_id,
        },
        size: 100,
      },
    ),
  ];

  return { columns, getConstructionIdOptions };
};
