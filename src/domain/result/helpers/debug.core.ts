import { DEBUGGING_ERROR_MESSAGES } from "@/constants/debugging-error-messages";
import { SIMULATION_BEFORE_AFTER_STEP_PATH, STEP_PATH } from "@/constants/routes";
import { buildingErrorMap } from "@/domain/basic-info/schemas/building.error-map";
import { buildingGUISchema, TBuildingGUISchema } from "@/domain/basic-info/schemas/building.schema";
import { floorErrorMap } from "@/domain/shape-info/schemas/floor/floor.error-map";
import { floorGuiSchema, TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";
import { surfaceErrorMap } from "@/domain/shape-info/schemas/surface/surface.error-map";
import { surfaceGuiSchema } from "@/domain/shape-info/schemas/surface/surface.schema";
import { zoneErrorMap } from "@/domain/shape-info/schemas/zone/zone.error-map";
import { zoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { SOURCE_SYSTEM_LABEL } from "@/domain/systems/source/constants/source-system.constants";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import {
  absorptionChillerGuiSchema,
  boilerGuiSchema,
  chillerGuiSchema,
  districtHeatingGuiSchema,
  geothermalHeatpumpGuiSchema,
  heatpumpGuiSchema,
  TSourceSystemGuiSchema,
} from "@/domain/systems/source/schemas/source-system.schema";
import { SUPPLY_SYSTEM_LABEL } from "@/domain/systems/supply/constants/supply-system.constants";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import {
  airHandlingUnitGuiSchema,
  electricRadiatorGuiSchema,
  fanCoilUnitGuiSchema,
  packagedAirConditionerGuiSchema,
  radiantFloorGuiSchema,
  radiatorGuiSchema,
  TSupplySystemGuiSchema,
} from "@/domain/systems/supply/schemas/supply-system.schema";
import {
  TVentilationEngineAndGuiSchema,
  ventilationEngineAndGuiSchema,
} from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { TGuiSchema } from "@/schemas/gui.schema";
import { TTemplateReference } from "@/types/template.types";

const ERROR_MESSAGES = {
  LABELS: {
    SOURCE_SYSTEM: "생산 설비",
    SUPPLY_SYSTEM: "공급 설비",
    VENTILATION_SYSTEM: "환기 설비",
  },
  SHAPE: {
    NO_COOLING_SYSTEM: "연결된 냉방 설비가 없습니다.",
    NO_FLOOR_OR_CEILING: "하나 이상의 바닥/천장이 등록되어야 합니다.",
    NO_FLOORS: "지상층/지하층 중 하나 이상이 존재해야 합니다.",
    NO_HEATING_SYSTEM: "연결된 난방 설비가 없습니다.",
    NO_VENTILATION_SYSTEM: "연결된 환기 설비가 없습니다.",
    NO_ZONES: "등록된 존이 없습니다.",
  },
  SYSTEM: {
    NO_PHOTOVOLTAIC: "등록된 발전 설비가 없습니다.",
    NO_SOURCE: "등록된 생산 설비가 없습니다.",
    NO_SOURCE_SYSTEM_CONNECTION: "생산 설비가 연결되어 있지 않습니다.",
    NO_SUPPLY: "등록된 공급 설비가 없습니다.",
    NO_VENTILATION: "등록된 환기 설비가 없습니다.",
    UNKNOWN_SOURCE_TYPE: "알 수 없는 생산 설비 타입",
    UNKNOWN_SUPPLY_TYPE: "알 수 없는 공급 설비 타입",
  },
} as const;

export type TDebugErrorRequireAndOptionalSet = {
  optional: TDebugErrorSet; // 권장 항목
  required: TDebugErrorSet; // 필수 항목
};

export type TDebugErrorSet = {
  after: TDebugErrorSetRemodelingItem;
  before: TDebugErrorSetRemodelingItem;
  common: TDebugErrorSetCommonItem;
};

export type TDebugErrorSetCommonItem = {
  buildingInfo: TErrorItem[];
  sourceSystem: TErrorItem[];
  supplySystem: TErrorItem[];
  ventilationSystem: TErrorItem[];
};

export type TDebugErrorSetRemodelingItem = {
  renewableSys: TErrorItem[];
  shapeInfo: TErrorItem[];
};

type TErrorItem = {
  message: string;
  path: string;
};

//
// 디버깅 모듈
//
const getInItRemodelingDebugErrorSet = (): TDebugErrorSetRemodelingItem => ({
  renewableSys: [],
  shapeInfo: [],
});

const getInitCommonDebugErrorSet = (): TDebugErrorSetCommonItem => ({
  buildingInfo: [],
  sourceSystem: [],
  supplySystem: [],
  ventilationSystem: [],
});

const getInitDebugErrorSet = (): TDebugErrorSet => ({
  after: getInItRemodelingDebugErrorSet(),
  before: getInItRemodelingDebugErrorSet(),
  common: getInitCommonDebugErrorSet(),
});

const getInitDebugErrorRequireAndOptionalSet = (): TDebugErrorRequireAndOptionalSet => ({
  optional: getInitDebugErrorSet(),
  required: getInitDebugErrorSet(),
});

export const executeDebugging = (guiData: TGuiSchema): TDebugErrorRequireAndOptionalSet => {
  const result = getInitDebugErrorRequireAndOptionalSet();

  const {
    afterBuilding: {
      buildingFloors: afterShapeInfo,
      photovoltaic_systems: afterPhotovoltaicSystems,
    },
    beforeBuilding: {
      buildingFloors: beforeShapeInfo,
      photovoltaic_systems: beforePhotovoltaicSystems,
    },
    buildingInfo,
    sourceSystems,
    supplySystems,
    ventilationSystems,

    // 아래 5개는 검증 안 함
    // fenestrationConstructions, fenestrations, materials, surfaceConstructions, photovoltaicSystems
  } = guiData;

  // buildingInfo
  const buildingInfoResult = debugBuildingInfo(buildingInfo);
  result.required.common.buildingInfo.push(...buildingInfoResult);

  // photovoltaicSysInfo
  const beforePhotovoltaicSystemResult = debugPhotovoltaicSystem(
    beforePhotovoltaicSystems,
    ERemodelingType.BEFORE,
  );
  const afterPhotovoltaicSystemResult = debugPhotovoltaicSystem(
    afterPhotovoltaicSystems,
    ERemodelingType.AFTER,
  );
  result.optional.before.shapeInfo.push(...beforePhotovoltaicSystemResult);
  result.optional.after.shapeInfo.push(...afterPhotovoltaicSystemResult);

  // shapeInfo
  const beforeShapeInfoResult = debugShapeInfo(beforeShapeInfo, ERemodelingType.BEFORE);
  const afterShapeInfoResult = debugShapeInfo(afterShapeInfo, ERemodelingType.AFTER);
  result.required.before.shapeInfo.push(...beforeShapeInfoResult.required);
  result.required.after.shapeInfo.push(...afterShapeInfoResult.required);
  result.optional.before.shapeInfo.push(...beforeShapeInfoResult.optional);
  result.optional.after.shapeInfo.push(...afterShapeInfoResult.optional);

  // common
  const commonSourceSystemResult = debugSourceSystem(sourceSystems);
  const commonSupplySystemResult = debugSupplySystem(supplySystems);
  const commonVentilationSystemResult = debugVentilationSystem(ventilationSystems);
  result.optional.common.sourceSystem.push(...commonSourceSystemResult);
  result.optional.common.supplySystem.push(...commonSupplySystemResult);
  result.optional.common.ventilationSystem.push(...commonVentilationSystemResult);

  return result;
};

//
// 건물 정보 디버깅
//
const debugBuildingInfo = (buildingInfo: TBuildingGUISchema): TErrorItem[] => {
  const buildingInfoResult = buildingGUISchema.safeParse(buildingInfo, {
    errorMap: buildingErrorMap,
  });

  if (buildingInfoResult.success) {
    return [];
  }

  return buildingInfoResult.error.issues.map(({ path }) => {
    const field = path[0] as keyof typeof DEBUGGING_ERROR_MESSAGES.building_info;

    return {
      message: `${DEBUGGING_ERROR_MESSAGES.building_info[field]}`,
      path: STEP_PATH.BASIC_INFO.path,
    };
  });
};

//
// 형상 정보 디버깅
//
const debugShapeInfo = (
  shapeInfo: TFloorGuiSchema[],
  remodelingType: ERemodelingType,
): { optional: TErrorItem[]; required: TErrorItem[] } => {
  const errors: { optional: TErrorItem[]; required: TErrorItem[] } = {
    optional: [],
    required: [],
  };

  if (shapeInfo.length === 0) {
    errors.required.push({
      message: ERROR_MESSAGES.SHAPE.NO_FLOORS,
      path: SIMULATION_BEFORE_AFTER_STEP_PATH.BUILDING_OVERVIEW.path(remodelingType),
    });
  }

  shapeInfo.forEach((floor) => {
    const floorShapePath = floor.floor_name;

    // zone 제외 하고 검사
    const floorResult = floorGuiSchema
      .omit({ zones: true })
      .safeParse(floor, { errorMap: floorErrorMap });
    if (!floorResult.success) {
      floorResult.error.issues.forEach(({ message }) => {
        errors.required.push({
          message: `${floorShapePath}: ${message}`,
          path: SIMULATION_BEFORE_AFTER_STEP_PATH.FLOOR.path(remodelingType, floor.floor_id),
        });
      });
    }

    // zone 유무 검사
    if (floor.zones.length === 0) {
      errors.required.push({
        message: `${floorShapePath}: ${ERROR_MESSAGES.SHAPE.NO_ZONES}`,
        path: SIMULATION_BEFORE_AFTER_STEP_PATH.FLOOR.path(remodelingType, floor.floor_id),
      });
    }

    // zone 속성 검사
    floor.zones.forEach((zone) => {
      const zoneShapePath = `${floorShapePath} > ${zone.name}`;

      // zone 권장 사항 검사
      if (!zone.supply_system_cooling_id) {
        errors.optional.push({
          message: `${zoneShapePath}: ${ERROR_MESSAGES.SHAPE.NO_COOLING_SYSTEM}`,
          path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path(remodelingType, zone.id),
        });
      }

      if (!zone.supply_system_heating_id) {
        errors.optional.push({
          message: `${zoneShapePath}: ${ERROR_MESSAGES.SHAPE.NO_HEATING_SYSTEM}`,
          path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path(remodelingType, zone.id),
        });
      }

      if (!zone.ventilation_system_id) {
        errors.optional.push({
          message: `${zoneShapePath}: ${ERROR_MESSAGES.SHAPE.NO_VENTILATION_SYSTEM}`,
          path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path(remodelingType, zone.id),
        });
      }

      // surface 제외 하고 검사
      const zoneResult = zoneGuiSchema
        .omit({ surfaces: true })
        .safeParse(zone, { errorMap: zoneErrorMap });

      if (!zoneResult.success) {
        zoneResult.error.issues.forEach(({ message }) => {
          errors.required.push({
            message: `${zoneShapePath}: ${message}`,
            path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path(remodelingType, zone.id),
          });
        });
      }

      // surface 바닥/천장 유무 검사
      const hasFloor = zone.surfaces.some(
        (surface) => surface.type === BUILDING_SURFACE_TYPE.floor,
      );
      const hasCeiling = zone.surfaces.some(
        (surface) => surface.type === BUILDING_SURFACE_TYPE.ceiling,
      );
      if (!hasFloor && !hasCeiling) {
        errors.required.push({
          message: `${zoneShapePath}: ${ERROR_MESSAGES.SHAPE.NO_FLOOR_OR_CEILING}`,
          path: SIMULATION_BEFORE_AFTER_STEP_PATH.ZONE.path(remodelingType, zone.id),
        });
      }

      // surface 속성 검사
      zone.surfaces.forEach((surface) => {
        const surfaceShapePath = `${zoneShapePath} > ${surface.name}`;

        const surfaceResult = surfaceGuiSchema.safeParse(surface, { errorMap: surfaceErrorMap });

        if (!surfaceResult.success) {
          surfaceResult.error.issues.forEach(({ message, path }) => {
            const field = path[0] as keyof typeof DEBUGGING_ERROR_MESSAGES.shape_info.surface;

            if (field === "coolroof_reflectance") {
              errors.required.push({
                message: `${surfaceShapePath}: ${DEBUGGING_ERROR_MESSAGES.shape_info.surface[field]}`,
                path: SIMULATION_BEFORE_AFTER_STEP_PATH.SURFACE.path(remodelingType, surface.id),
              });
            } else {
              errors.required.push({
                message: `${surfaceShapePath}: ${message}`,
                path: SIMULATION_BEFORE_AFTER_STEP_PATH.SURFACE.path(remodelingType, surface.id),
              });
            }
          });
        }
      });
    });
  });

  return errors;
};

//
// 태양광 발전 디버깅
//
const debugPhotovoltaicSystem = (
  photovoltaicSystems: TTemplateReference[],
  remodelingType: ERemodelingType,
): TErrorItem[] => {
  const errors: TErrorItem[] = [];

  if (photovoltaicSystems.length === 0) {
    errors.push({
      message: ERROR_MESSAGES.SYSTEM.NO_PHOTOVOLTAIC,
      path: SIMULATION_BEFORE_AFTER_STEP_PATH.BUILDING_OVERVIEW.path(remodelingType),
    });
  }

  return errors;
};

//
// 환기 설비 디버깅
//
const debugVentilationSystem = (
  ventilationSystems: TVentilationEngineAndGuiSchema[],
): TErrorItem[] => {
  const errors: TErrorItem[] = [];

  if (ventilationSystems.length === 0) {
    errors.push({
      message: ERROR_MESSAGES.SYSTEM.NO_VENTILATION,
      path: STEP_PATH.VENTILATION_SYSTEMS.path,
    });
  }

  ventilationSystems.forEach((system) => {
    const ventilationSystemResult = ventilationEngineAndGuiSchema.safeParse(system);
    if (!ventilationSystemResult.success) {
      ventilationSystemResult.error.issues.forEach(({ message }) => {
        errors.push({
          message: `${ERROR_MESSAGES.LABELS.VENTILATION_SYSTEM} > ${system.name}: ${message}`,
          path: STEP_PATH.VENTILATION_SYSTEMS.path,
        });
      });
    }
  });

  return errors;
};

//
// 공급 설비 디버깅
//
const debugSupplySystem = (supplySystems: TSupplySystemGuiSchema): TErrorItem[] => {
  const errors: TErrorItem[] = [];

  const totalCount = Object.values(supplySystems).reduce((acc, curr) => acc + curr.length, 0);

  if (totalCount === 0) {
    errors.push({
      message: ERROR_MESSAGES.SYSTEM.NO_SUPPLY,
      path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
    });
  }

  // 각 공급 설비 타입별로 개별 스키마 검증
  Object.entries(supplySystems).forEach(([systemType, systemList]) => {
    const systemTypeEnum = systemType as ESupplySystemType;

    // 각 시스템을 개별적으로 safeParse로 검증
    systemList.forEach((system) => {
      let result;

      if (
        systemTypeEnum !== ESupplySystemType.PACKAGED_AIR_CONDITIONER &&
        systemTypeEnum !== ESupplySystemType.ELECTRIC_RADIATOR
      ) {
        const systemWithSourceSystemId =
          system as TSupplySystemGuiSchema[ESupplySystemType.AIR_HANDLING_UNIT][number];
        if (!systemWithSourceSystemId.source_system_id) {
          errors.push({
            message: `공급 설비 > ${SUPPLY_SYSTEM_LABEL[systemTypeEnum]} > ${system.name}: ${ERROR_MESSAGES.SYSTEM.NO_SOURCE_SYSTEM_CONNECTION}`,
            path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
          });
        }
      }

      // 공급 설비 타입에 따라 적절한 스키마 선택
      switch (systemTypeEnum) {
        case ESupplySystemType.AIR_HANDLING_UNIT: {
          const airHandlingUnit =
            system as TSupplySystemGuiSchema[ESupplySystemType.AIR_HANDLING_UNIT][number];
          result = airHandlingUnitGuiSchema.safeParse(airHandlingUnit);
          break;
        }
        case ESupplySystemType.ELECTRIC_RADIATOR:
          result = electricRadiatorGuiSchema.safeParse(system);
          break;
        case ESupplySystemType.FAN_COIL_UNIT:
          result = fanCoilUnitGuiSchema.safeParse(system);
          break;
        case ESupplySystemType.PACKAGED_AIR_CONDITIONER:
          result = packagedAirConditionerGuiSchema.safeParse(system);
          break;
        case ESupplySystemType.RADIANT_FLOOR:
          result = radiantFloorGuiSchema.safeParse(system);
          break;
        case ESupplySystemType.RADIATOR:
          result = radiatorGuiSchema.safeParse(system);
          break;
        default:
          errors.push({
            message: `${ERROR_MESSAGES.SYSTEM.UNKNOWN_SUPPLY_TYPE}: ${systemTypeEnum}`,
            path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
          });
          return;
      }

      if (!result.success) {
        result.error.issues.forEach(({ message }) => {
          errors.push({
            message: `${ERROR_MESSAGES.LABELS.SUPPLY_SYSTEM} > ${SUPPLY_SYSTEM_LABEL[systemTypeEnum]} > ${system.name}: ${message}`,
            path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
          });
        });
      }
    });
  });

  return errors;
};

//
// 생산 설비 디버깅
//
const debugSourceSystem = (sourceSystems: TSourceSystemGuiSchema): TErrorItem[] => {
  const errors: TErrorItem[] = [];

  const totalCount = Object.values(sourceSystems).reduce((acc, curr) => acc + curr.length, 0);

  if (totalCount === 0) {
    errors.push({
      message: ERROR_MESSAGES.SYSTEM.NO_SOURCE,
      path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
    });
  }

  Object.entries(sourceSystems).forEach(([systemType, systemList]) => {
    systemList.forEach((system) => {
      let result;
      const systemTypeEnum = systemType as ESourceSystemType;

      switch (systemTypeEnum) {
        case ESourceSystemType.ABSORPTION_CHILLER:
          result = absorptionChillerGuiSchema.safeParse(system);
          break;
        case ESourceSystemType.BOILER:
          result = boilerGuiSchema.safeParse(system);
          break;
        case ESourceSystemType.CHILLER:
          result = chillerGuiSchema.safeParse(system);
          break;
        case ESourceSystemType.DISTRICT_HEATING:
          result = districtHeatingGuiSchema.safeParse(system);
          break;
        case ESourceSystemType.GEOTHERMAL_HEATPUMP:
          result = geothermalHeatpumpGuiSchema.safeParse(system);
          break;
        case ESourceSystemType.HEATPUMP:
          result = heatpumpGuiSchema.safeParse(system);
          break;
        default:
          errors.push({
            message: `${ERROR_MESSAGES.SYSTEM.UNKNOWN_SOURCE_TYPE}: ${systemTypeEnum}`,
            path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
          });
          return;
      }

      if (!result.success) {
        result.error.issues.forEach(({ message }) => {
          errors.push({
            message: `${ERROR_MESSAGES.LABELS.SOURCE_SYSTEM} > ${SOURCE_SYSTEM_LABEL[systemTypeEnum]} > ${system.name}: ${message}`,
            path: STEP_PATH.SOURCE_SUPPLY_SYSTEMS.path,
          });
        });
      }
    });
  });

  return errors;
};
