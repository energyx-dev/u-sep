import dayjs from "dayjs";
import { useShallow } from "zustand/shallow";

import { useBuildingInfoStore } from "@/domain/basic-info/stores/building.store";
import { useSystemToEngineFormat } from "@/domain/result/hooks/useSystemToEngineFormat";
import {
  TFloorEngineSchema,
  TFloorGuiSchema,
} from "@/domain/shape-info/schemas/floor/floor.schema";
import { BOUNDARY_CONDITION_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import {
  TSurfaceEngineSchema,
  TSurfaceGuiSchema,
} from "@/domain/shape-info/schemas/surface/surface.schema";
import { TZoneEngineSchema, TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { convertTemplateToInstances } from "@/lib/convert";
import { TEngineSchema } from "@/schemas/engine.schema";

const convertToSurfaceEngineSchema = (surfaces: TSurfaceGuiSchema[]): TSurfaceEngineSchema[] =>
  surfaces.map((surface) => ({
    adjacent_zone_id: surface.adjacent_zone_id ?? undefined,
    area: surface.area,
    azimuth: surface.azimuth ?? undefined,
    // TODO 확인 필요 빈 스트링 -> 검증 필요
    boundary_condition:
      surface.boundary_condition === ""
        ? BOUNDARY_CONDITION_TYPE.adiabatic
        : surface.boundary_condition,
    construction_id: surface.construction_id,
    coolroof_reflectance: surface.coolroof_reflectance ?? undefined,
    fenestrations: [], // actual mapping pending
    id: surface.id,
    name: surface.name,
    type: surface.type,
  }));

const convertToZoneEngineSchema = (zones: TZoneGuiSchema[]): TZoneEngineSchema[] =>
  zones.map((zone) => ({
    height: zone.height,
    id: zone.id,
    infiltration: zone.infiltration,
    light_density: zone.light_density,
    lightning: zone.lightning,
    name: zone.name,
    profile: zone.profile,
    profile_id: zone.profile_id ?? undefined,
    supply_system_cooling_id: zone.supply_system_cooling_id ?? null,
    supply_system_heating_id: zone.supply_system_heating_id ?? null,
    surfaces: convertToSurfaceEngineSchema(zone.surfaces),
    ventilation_system_id: zone.ventilation_system_id ?? null,
  }));

const convertToFloorEngineSchema = (floors: TFloorGuiSchema[]): TFloorEngineSchema[] =>
  floors.map((floor) => ({
    floor_number: floor.floor_number,
    zones: convertToZoneEngineSchema(floor.zones),
  }));

export const useBuildingToEngineFormat = (type: ERemodelingType): TEngineSchema["building"] => {
  const { sourceSystems, supplySystems, ventilationSystems } = useSystemToEngineFormat();
  const { buildingFloors: buildingFloors, photovoltaic_systems: photovoltaicSystemTemplates } =
    useBuildingGeometryStore(type);
  const { buildingInfo: buildingInfoState } = useBuildingInfoStore(
    useShallow((state) => ({
      buildingInfo: state.buildingInfo,
    })),
  );
  const { photovoltaic_systems: masterPhotovoltaicSystemState } = useRenewableStore(
    useShallow((state) => ({
      photovoltaic_systems: state.photovoltaic_systems,
    })),
  );

  const convertedFloors = convertToFloorEngineSchema(buildingFloors ?? []);

  const address =
    `${buildingInfoState.addressRegion ?? ""} ${buildingInfoState.addressDistrict ?? ""} ${
      buildingInfoState.detailAddress ?? ""
    }`.trim();

  const name = buildingInfoState.name ?? "";
  const north_axis = buildingInfoState.north_axis ?? 0;

  const abovegroundFloor = buildingFloors
    ? Math.max(...buildingFloors.filter((e) => e.floor_number > 0).map((e) => e.floor_number), 0)
    : 0;

  const undergroundFloor = Math.abs(
    buildingFloors
      ? Math.min(...buildingFloors.filter((e) => e.floor_number < 0).map((e) => e.floor_number), 0)
      : 0,
  );

  const vintage_year = dayjs(buildingInfoState.vintage).get("year");
  const vintage_month = dayjs(buildingInfoState.vintage).get("month");
  const vintage_day = dayjs(buildingInfoState.vintage).get("D");

  const vintage: TEngineSchema["building"]["vintage"] = [
    vintage_year,
    vintage_month + 1,
    vintage_day,
  ];

  const convertedPhotovoltaicSystems = convertTemplateToInstances({
    masterList: masterPhotovoltaicSystemState,
    templateList: photovoltaicSystemTemplates,
  });

  return {
    address: address,
    floors: convertedFloors,
    name: name,
    north_axis: north_axis,
    num_aboveground_floor: abovegroundFloor,
    num_underground_floor: undergroundFloor,
    photovoltaic_systems: convertedPhotovoltaicSystems,
    source_systems: sourceSystems,
    supply_systems: supplySystems,
    ventilation_systems: ventilationSystems,
    vintage: vintage,
  };
};
