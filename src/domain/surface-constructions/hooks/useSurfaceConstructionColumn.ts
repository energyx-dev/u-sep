import { createColumnHelper } from "@tanstack/react-table";
import { useShallow } from "zustand/shallow";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { useMaterialStore } from "@/domain/material/stores/material.store";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { SURFACE_LAYERS_COLUMN_COUNT } from "@/domain/surface-constructions/constants/constants";
import {
  mToMm,
  TSurfaceConstructionTable,
  TSurfaceConstructionViewTable,
} from "@/domain/surface-constructions/helper/helper.util";
import { computeU, formatU } from "@/lib/helper";

type TProps = {
  floorStatus?: {
    isMax: boolean;
    isMin: boolean;
  };
  surfaceData?: TSurfaceGuiSchema;
  type?: BUILDING_SURFACE_TYPE;
};

export const useSurfaceConstructionColumn = ({ floorStatus, surfaceData, type }: TProps) => {
  const { materials } = useMaterialStore(
    useShallow((state) => ({
      materials: state.materials,
    })),
  );

  const columnHelper = createColumnHelper<TSurfaceConstructionTable>();
  const columnHelperView = createColumnHelper<TSurfaceConstructionViewTable>();
  const columnHelperSurfaceView = createColumnHelper<TSurfaceConstructionViewTable>();

  const materialOptions = materials.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const surfaceConstructionsColumn = [
    columnHelper.accessor((row) => row.name, {
      header: "이름",
      id: "name",
      meta: { isRequired: true, placeholder: PLACEHOLDERS.elements.surface_construction.name },
      size: 1,
    }),
    ...Array.from({ length: SURFACE_LAYERS_COLUMN_COUNT }, (_, index) => [
      columnHelper.accessor(
        (row) => {
          return materialOptions.find((data) => data.value === row[`material_${index}`])?.label;
        },
        {
          header: "재료",
          id: `material_${index}`,
          meta: {
            placeholder: PLACEHOLDERS.elements.surface_construction.layers.material_id,
            selectOptions: materialOptions,
            ...(index === 0 ? { isRequired: true } : {}),
          },
          size: 100,
        },
      ),
      columnHelper.accessor(`thickness_${index}`, {
        header: "두께",
        id: `thickness_${index}`,
        meta: {
          inputType: "number",
          placeholder: PLACEHOLDERS.elements.surface_construction.layers.thickness,
        },
        size: 100,
      }),
    ]).flat(),
  ];
  const surfaceConstructionsViewColumn = [
    columnHelperView.accessor((row) => row.name, {
      header: "이름",
      id: "name",
      meta: { isRequired: true },
      size: 172,
    }),
    columnHelperView.accessor(
      (row) =>
        row.layers.map((layer) => {
          const materialLabel = materials.find((m) => m.id === layer.material_id)?.name;
          return `${materialLabel}, ${mToMm(layer.thickness)}mm`;
        }),
      {
        // type이 undefined이므로 면구조체 테이블의 재료 column 헤더의 text가 분기처리 되지 않음.
        // SurfaceConstructionManageForm에서 type을 전달하지 않고 있어서 추가..
        header: !type
          ? "재료"
          : type === BUILDING_SURFACE_TYPE.ceiling || type === BUILDING_SURFACE_TYPE.floor
            ? "재료(순서: 외부→내부)"
            : "재료(순서: 외부→내부)",
        id: "layers",
        size: 696,
      },
    ),
  ];

  const surfaceConstructionsSurfaceViewColumn = [
    columnHelperSurfaceView.accessor((row) => row.name, {
      header: "이름",
      id: "name",
      meta: { isRequired: true },
      size: 50,
    }),
    {
      accessorFn: (row: TSurfaceConstructionViewTable) => {
        return formatU(
          computeU({
            isMaxFloor: floorStatus?.isMax,
            isMinFloor: floorStatus?.isMin,
            layers: row.layers ?? [],
            materials,
            surface_type: surfaceData?.type,
          }),
        );
      },
      header: "열관류율(W/m²·K)",
      id: "u",
      size: 50,
    },
    columnHelperSurfaceView.accessor(
      (row) =>
        row.layers.map((layer) => {
          const materialLabel = materials.find((m) => m.id === layer.material_id)?.name;
          return `${materialLabel}, ${mToMm(layer.thickness)}mm`;
        }),
      {
        header: !type
          ? "재료"
          : type === BUILDING_SURFACE_TYPE.ceiling || type === BUILDING_SURFACE_TYPE.floor
            ? "재료(순서: 외부→내부)"
            : "재료(순서: 외부→내부)",
        id: "layers",
      },
    ),
  ];

  return {
    surfaceConstructionsColumn,
    surfaceConstructionsSurfaceViewColumn,
    surfaceConstructionsViewColumn,
  };
};
