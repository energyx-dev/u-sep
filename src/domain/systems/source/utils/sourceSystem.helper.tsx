import { createColumnHelper } from "@tanstack/react-table";
import { isNil } from "es-toolkit";

import { PLACEHOLDERS } from "@/constants/placeholders";
import {
  COMPRESSOR_LABEL,
  COOLING_TOWER_CONTROL_LABEL,
  COOLING_TOWER_TYPE_LABEL,
  FUEL_LABEL,
} from "@/domain/systems/source/constants/source-system.constants";
import {
  ECompressorType,
  ECoolingTowerControlType,
  ECoolingTowerType,
  EFuelType,
  ESourceSystemType,
} from "@/domain/systems/source/constants/sourceSystem.enums";
import {
  TAbsorptionChillerGuiAddSchema,
  TBoilerGuiAddSchema,
  TChillerGuiAddSchema,
  TDistrictHeatingGuiAddSchema,
  TGeothermalHeatpumpGuiAddSchema,
  THeatpumpGuiAddSchema,
} from "@/domain/systems/source/schemas/source-system-add.schema";
import { getOptionsSortedByLabel } from "@/lib/helper";

//
// 사용될 columnHelper 데이터 모아둚
//
type TCommonColumn = {
  boiler_efficiency?: number;
  capacity_cooling?: number;
  capacity_heating?: number;
  compressor_type?: ECompressorType;
  coolingtower_capacity?: number;
  coolingtower_control?: ECoolingTowerControlType;
  coolingtower_type?: ECoolingTowerType;
  cop_cooling?: number;
  cop_heating?: number;
  efficiency?: number;
  fuel_type?: EFuelType;
  hotwater_supply?: boolean;
  name: string;
};

const createAllColumns = <T extends TCommonColumn>(
  columnHelper: ReturnType<typeof createColumnHelper<T>>,
) => {
  const columns = [
    columnHelper.accessor((row) => row.name, {
      header: "이름",
      id: "name",
      meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.source_system.name },
      size: 100,
    }),
    columnHelper.accessor(
      (row) => {
        const value = row.fuel_type;
        return value ? (FUEL_LABEL[value] ?? value) : value;
      },
      {
        header: "연료 종류",
        id: "fuel_type",
        meta: {
          isRequired: true,
          placeholder: PLACEHOLDERS.systems.source_system.fuel_type,
          selectOptions: getOptionsSortedByLabel(FUEL_LABEL),
        },
        size: 100,
      },
    ),
    columnHelper.accessor((row) => row.cop_heating, {
      header: "난방 COP",
      id: "cop_heating",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.cop_heating,
      },
      size: 100,
    }),
    columnHelper.accessor((row) => row.cop_cooling, {
      header: "냉방 COP",
      id: "cop_cooling",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.cop_cooling,
      },
      size: 100,
    }),
    columnHelper.accessor((row) => row.efficiency, {
      header: "효율(%)",
      id: "efficiency",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.efficiency,
      },
      size: 100,
    }),
    columnHelper.accessor((row) => row.capacity_heating, {
      header: "난방 용량(W)",
      id: "capacity_heating",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.capacity_heating,
      },
      size: 100,
    }),
    columnHelper.accessor((row) => row.capacity_cooling, {
      header: "냉방 용량(W)",
      id: "capacity_cooling",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.capacity_cooling,
      },
      size: 100,
    }),
    columnHelper.accessor((row) => row.boiler_efficiency, {
      header: "보일러 효율(%)",
      id: "boiler_efficiency",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.boiler_efficiency,
      },
      size: 100,
    }),
    columnHelper.accessor(
      (row) => {
        const value = row.compressor_type;
        return value ? (COMPRESSOR_LABEL[value] ?? value) : value;
      },
      {
        header: "압축기 방식",
        id: "compressor_type",
        meta: {
          placeholder: PLACEHOLDERS.systems.source_system.compressor_type,
          selectOptions: getOptionsSortedByLabel(COMPRESSOR_LABEL),
        },
        size: 100,
      },
    ),
    columnHelper.accessor(
      (row) => {
        const value = row.coolingtower_type;
        return value ? (COOLING_TOWER_TYPE_LABEL[value] ?? value) : value;
      },
      {
        header: "냉각탑 종류",
        id: "coolingtower_type",
        meta: {
          placeholder: PLACEHOLDERS.systems.source_system.coolingtower_type,
          selectOptions: getOptionsSortedByLabel(COOLING_TOWER_TYPE_LABEL),
        },
        size: 100,
      },
    ),
    columnHelper.accessor((row) => row.coolingtower_capacity, {
      header: "냉각탑 용량(W)",
      id: "coolingtower_capacity",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.source_system.coolingtower_capacity,
      },
      size: 100,
    }),
    columnHelper.accessor(
      (row) => {
        const value = row.coolingtower_control;
        return value ? (COOLING_TOWER_CONTROL_LABEL[value] ?? value) : value;
      },
      {
        header: "냉각탑 제어방식",
        id: "coolingtower_control",
        meta: {
          placeholder: PLACEHOLDERS.systems.source_system.coolingtower_control,
          selectOptions: getOptionsSortedByLabel(COOLING_TOWER_CONTROL_LABEL),
        },
        size: 100,
      },
    ),
    columnHelper.accessor(
      (row) => (isNil(row.hotwater_supply) ? "" : row.hotwater_supply ? "가능" : "불가능"),
      {
        header: "급탕 가능 여부",
        id: "hotwater_supply",
        meta: {
          inputType: "boolean",
          placeholder: PLACEHOLDERS.systems.source_system.hotwater_supply,
          selectOptions: [
            { label: "가능", value: true },
            { label: "불가능", value: false },
          ],
        },
        size: 100,
      },
    ),
  ];

  return columns;
};

//
// absorption_chiller
//
const getAbsorptionChillerAddColumns = () => {
  const columnHelper = createColumnHelper<TAbsorptionChillerGuiAddSchema>();
  const keys: string[] = [
    "boiler_efficiency",
    "capacity_cooling",
    "cop_cooling",
    "fuel_type",
    "name",
  ] satisfies (keyof TAbsorptionChillerGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// boiler
//
const getBoilerAddColumns = () => {
  const columnHelper = createColumnHelper<TBoilerGuiAddSchema>();
  const keys: string[] = [
    "capacity_heating",
    "efficiency",
    "fuel_type",
    "name",
    "hotwater_supply",
  ] satisfies (keyof TBoilerGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// chiller
//

const getChillerAddColumns = () => {
  const columnHelper = createColumnHelper<TChillerGuiAddSchema>();
  const keys: string[] = [
    "capacity_cooling",
    "cop_cooling",
    "fuel_type",
    "name",
    "compressor_type",
    "coolingtower_type",
    "coolingtower_capacity",
    "coolingtower_control",
  ] satisfies (keyof TChillerGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

// district_heating

const getDistrictHeatingAddColumns = () => {
  const columnHelper = createColumnHelper<TDistrictHeatingGuiAddSchema>();
  const keys: string[] = [
    "name",
    "hotwater_supply",
  ] satisfies (keyof TDistrictHeatingGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

// geothermal_heatpump

const getGeothermalHeatpumpAddColumns = () => {
  const columnHelper = createColumnHelper<TGeothermalHeatpumpGuiAddSchema>();
  const keys: string[] = [
    "capacity_cooling",
    "capacity_heating",
    "cop_cooling",
    "cop_heating",
    "fuel_type",
    "name",
  ] satisfies (keyof TGeothermalHeatpumpGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

// heatpump

const getHeatpumpAddColumns = () => {
  const columnHelper = createColumnHelper<THeatpumpGuiAddSchema>();
  const keys: string[] = [
    "capacity_cooling",
    "capacity_heating",
    "cop_cooling",
    "cop_heating",
    "fuel_type",
    "name",
  ] satisfies (keyof THeatpumpGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

export const SOURCE_SYSTEM_COLUMN = {
  [ESourceSystemType.ABSORPTION_CHILLER]: getAbsorptionChillerAddColumns(),
  [ESourceSystemType.BOILER]: getBoilerAddColumns(),
  [ESourceSystemType.CHILLER]: getChillerAddColumns(),
  [ESourceSystemType.DISTRICT_HEATING]: getDistrictHeatingAddColumns(),
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: getGeothermalHeatpumpAddColumns(),
  [ESourceSystemType.HEATPUMP]: getHeatpumpAddColumns(),
};
