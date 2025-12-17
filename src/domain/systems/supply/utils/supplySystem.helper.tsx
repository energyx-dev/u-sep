import { createColumnHelper } from "@tanstack/react-table";

import { PLACEHOLDERS } from "@/constants/placeholders";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import {
  TAirHandlingUnitGuiAddSchema,
  TElectricRadiatorGuiAddSchema,
  TFanCoilUnitGuiAddSchema,
  TPackagedAirConditionerGuiAddSchema,
  TRadiantFloorGuiAddSchema,
  TRadiatorGuiAddSchema,
} from "@/domain/systems/supply/schemas/supply-system-add.schema";

//
// 사용될 columnHelper 데이터 모아둚
//
type TCommonColumn = {
  capacity_cooling?: number; // 냉방 용량 (W)
  capacity_heating?: number; // 난방 용량 (W)
  cop_cooling?: number; // 냉방 효율
  name: string;
  purpose?: EPurpose | null;
  source_system_id?: null | string; // or district_heating
};

const createAllColumns = <T extends TCommonColumn>(
  columnHelper: ReturnType<typeof createColumnHelper<T>>,
) => {
  const columns = [
    columnHelper.accessor((row) => row.name, {
      header: "이름",
      id: "name",
      meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.supply_system.name },
    }),
    columnHelper.accessor((row) => row.purpose, {
      header: "용도",
      id: "purpose",
      meta: { isRequired: true, placeholder: PLACEHOLDERS.systems.supply_system.purpose },
    }),
    columnHelper.accessor((row) => row.cop_cooling, {
      header: "냉방 COP",
      id: "cop_cooling",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.supply_system.cop_cooling,
      },
    }),
    columnHelper.accessor((row) => row.capacity_cooling, {
      header: "냉방 용량(W)",
      id: "capacity_cooling",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.supply_system.capacity_cooling,
      },
    }),
    columnHelper.accessor((row) => row.capacity_heating, {
      header: "난방 용량(W)",
      id: "capacity_heating",
      meta: {
        inputType: "number",
        placeholder: PLACEHOLDERS.systems.supply_system.capacity_heating,
      },
    }),
    columnHelper.accessor((row) => row.source_system_id, {
      header: "생산 설비",
      id: "source_system_id",
      meta: { placeholder: PLACEHOLDERS.systems.supply_system.source_system_id },
    }),
  ];

  return columns;
};

//
// air_handling_unit
//
const getAirHandlingUnitAddColumns = () => {
  const columnHelper = createColumnHelper<TAirHandlingUnitGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "source_system_id",
  ] satisfies (keyof TAirHandlingUnitGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// electric_radiator
//
const getElectricRadiatorAddColumns = () => {
  const columnHelper = createColumnHelper<TElectricRadiatorGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "capacity_heating",
  ] satisfies (keyof TElectricRadiatorGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// packaged_air_conditioner
//
const getPackagedAirConditionerAddColumns = () => {
  const columnHelper = createColumnHelper<TPackagedAirConditionerGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "capacity_cooling",
    "cop_cooling",
  ] satisfies (keyof TPackagedAirConditionerGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// radiant_floor
//
const getRadiantFloorAddColumns = () => {
  const columnHelper = createColumnHelper<TRadiantFloorGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "source_system_id",
  ] satisfies (keyof TRadiantFloorGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// radiator
//

const getRadiatorAddColumns = () => {
  const columnHelper = createColumnHelper<TRadiatorGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "capacity_heating",
    "source_system_id",
  ] satisfies (keyof TRadiatorGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

//
// fan_coil_unit
//
const getFanCoilUnitAddColumns = () => {
  const columnHelper = createColumnHelper<TFanCoilUnitGuiAddSchema>();
  const keys: string[] = [
    "name",
    "purpose",
    "source_system_id",
  ] satisfies (keyof TFanCoilUnitGuiAddSchema)[];

  return createAllColumns(columnHelper).filter((column) => keys.includes(column.id ?? ""));
};

export const SUPPLY_SYSTEM_CONFIG = {
  [ESupplySystemType.AIR_HANDLING_UNIT]: getAirHandlingUnitAddColumns(),
  [ESupplySystemType.ELECTRIC_RADIATOR]: getElectricRadiatorAddColumns(),
  [ESupplySystemType.FAN_COIL_UNIT]: getFanCoilUnitAddColumns(),
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: getPackagedAirConditionerAddColumns(),
  [ESupplySystemType.RADIANT_FLOOR]: getRadiantFloorAddColumns(),
  [ESupplySystemType.RADIATOR]: getRadiatorAddColumns(),
};
