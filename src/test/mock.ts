// import { random } from "es-toolkit";
// import { nanoid } from "nanoid";

import { TBuildingState } from "@/domain/basic-info/stores/building.store";
import {
  EFenestrationBlind,
  EFenestrationType,
} from "@/domain/fenestration/constants/fenestration.enum";
import { TFenestrationState } from "@/domain/fenestration/stores/fenestration.store";
import { TFenestrationConstructionState } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { TMaterialState } from "@/domain/material/stores/material.store";
// import { DAY_SCHEDULE_INTERVALS } from "@/domain/profile/day-schedule/day-sc-constants";
// import { EDayScType } from "@/domain/profile/day-schedule/day-sc.enums";
// import { TDayScState } from "@/domain/profile/day-schedule/day-sc.store";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import {
  BOUNDARY_CONDITION_TYPE,
  BUILDING_SURFACE_TYPE,
} from "@/domain/shape-info/schemas/surface/surface.enum";
import { ZONE_PROFILE_TYPE } from "@/domain/shape-info/schemas/zone/zone.enum";
import { TSurfaceConstructionState } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import {
  ECompressorType,
  ECoolingTowerControlType,
  ECoolingTowerType,
  EFuelType,
  ESourceSystemType,
} from "@/domain/systems/source/constants/sourceSystem.enums";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { EPurpose } from "@/domain/systems/supply/constants/purpose.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { TVentilationSystemState } from "@/domain/systems/ventilation/stores/ventilation.store";
// import { customNanoid } from "@/lib/utils";

export const MOCK_BUILDING_INFO: TBuildingState["buildingInfo"] = {
  addressDistrict: "강남구",
  addressRegion: "서울특별시",
  detailAddress: "테헤란로 123",
  name: "시뮬레이터 테스트 빌딩",
  north_axis: 0,
  vintage: "2023-12-01",
};

export const MOCK_SHAPE_INFO: TFloorGuiSchema[] = [
  {
    floor_id: "floor1",
    floor_name: "1층",
    floor_number: 1,
    zones: [
      {
        height: 4,
        id: "floor1_zone1",
        infiltration: 0.5,
        light_density: 15,
        lightning: [],
        name: "로비",
        profile: ZONE_PROFILE_TYPE.대규모사무실,
        surfaces: [
          {
            area: 120,
            azimuth: 0,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 20,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "fen_1_1_1_1",
              //   name: "북쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor1_zone1_wall1",
            name: "북쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 80,
            azimuth: 90,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor1_zone1_wall2",
            name: "동쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 120,
            azimuth: 180,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 20,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "fen_1_1_3_1",
              //   name: "남쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor1_zone1_wall3",
            name: "남쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 80,
            azimuth: 270,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor1_zone1_wall4",
            name: "서쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 200,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor1_zone1_ceil1",
            name: "천장",
            type: BUILDING_SURFACE_TYPE.ceiling,
          },
          {
            area: 200,
            boundary_condition: BOUNDARY_CONDITION_TYPE.ground,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor1_zone1_ground1",
            name: "바닥",
            type: BUILDING_SURFACE_TYPE.floor,
          },
        ],
      },
    ],
  },
  {
    floor_id: "floor2",
    floor_name: "2층",
    floor_number: 2,
    zones: [
      {
        height: 3,
        id: "floor2_zone1",
        infiltration: 0.3,
        light_density: 12,
        lightning: [],
        name: "사무실 A",
        profile: ZONE_PROFILE_TYPE.소규모사무실,
        surfaces: [
          {
            area: 60,
            azimuth: 0,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 10,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "fen_2_1_1_1",
              //   name: "북쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor2_zone1_wall1",
            name: "북쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 40,
            azimuth: 90,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone1_wall2",
            name: "동쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 60,
            azimuth: 180,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 10,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "fen_2_1_3_1",
              //   name: "남쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor2_zone1_wall3",
            name: "남쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 40,
            azimuth: 270,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone1_wall4",
            name: "서쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 100,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone1_ceil1",
            name: "천장",
            type: BUILDING_SURFACE_TYPE.ceiling,
          },
          {
            area: 100,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone1_ground1",
            name: "바닥",
            type: BUILDING_SURFACE_TYPE.floor,
          },
        ],
      },
      {
        height: 3,
        id: "floor2_zone2",
        infiltration: 0.3,
        light_density: 12,
        lightning: [],
        name: "사무실 B",
        profile: ZONE_PROFILE_TYPE.소규모사무실,
        surfaces: [
          {
            area: 60,
            azimuth: 0,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 10,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "floor2_zone2_wall1_fen1",
              //   name: "북쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor2_zone2_wall1",
            name: "북쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 40,
            azimuth: 90,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone2_wall2",
            name: "동쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 60,
            azimuth: 180,
            boundary_condition: BOUNDARY_CONDITION_TYPE.outdoors,
            construction_id: "unknown",
            fenestrations: [
              // {
              //   area: 10,
              //   blind: null,
              //   construction_id: "unknown",
              //   id: "floor2_zone2_wall3_fen1",
              //   name: "남쪽 창문",
              //   type: FENESTRATION_TYPE.window,
              // },
            ],
            id: "floor2_zone2_wall3",
            name: "남쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 40,
            azimuth: 270,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone2_wall4",
            name: "서쪽 벽",
            type: BUILDING_SURFACE_TYPE.wall,
          },
          {
            area: 100,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone2_ceil1",
            name: "천장",
            type: BUILDING_SURFACE_TYPE.ceiling,
          },
          {
            area: 100,
            boundary_condition: BOUNDARY_CONDITION_TYPE.zone,
            construction_id: "unknown",
            fenestrations: [],
            id: "floor2_zone2_ground1",
            name: "바닥",
            type: BUILDING_SURFACE_TYPE.floor,
          },
        ],
      },
    ],
  },
];

export const MOCK_PHOTOVOLTAIC_SYSTEM: TPhotovoltaicSystemEngineAndGuiSchema[] = [
  {
    area: 100,
    azimuth: 0,
    efficiency: 0.15,
    id: "pv_1",
    name: "태양광 시스템-1",
    tilt: 0,
  },
  {
    area: 100,
    azimuth: 0,
    efficiency: 0.15,
    id: "pv_2",
    name: "태양광 시스템-2",
    tilt: 0,
  },
  {
    area: 100,
    azimuth: 0,
    efficiency: 0.15,
    id: "pv_3",
    name: "태양광 시스템-3",
    tilt: 0,
  },
  {
    area: 100,
    azimuth: 0,
    efficiency: 0.15,
    id: "pv_4",
    name: "태양광 시스템-4",
    tilt: 0,
  },
];

export const MOCK_SUPPLY_SYSTEM: TSupplySystemGuiSchema = {
  [ESupplySystemType.AIR_HANDLING_UNIT]: [
    {
      id: "ahu_1",
      name: "AHU-1 (1층 로비)",
      purpose: EPurpose.COOLING_HEATING,
      source_system_id: "heatpump_1",
    },
    {
      id: "ahu_2",
      name: "AHU-2 (2층 사무실)",
      purpose: EPurpose.COOLING_HEATING,
      source_system_id: "heatpump_1",
    },
  ],
  [ESupplySystemType.ELECTRIC_RADIATOR]: [
    {
      id: "er_1",
      name: "전기 라디에이터-1",
      purpose: EPurpose.HEATING,
    },
  ],
  [ESupplySystemType.FAN_COIL_UNIT]: [
    {
      id: "fcu_1",
      name: "FCU-1",
      purpose: EPurpose.HEATING,
      source_system_id: "boiler_1",
    },
    {
      id: "fcu_2",
      name: "FCU-2",
      purpose: EPurpose.COOLING,
      source_system_id: "abs_chiller_1",
    },
  ],
  [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: [
    {
      capacity_cooling: 5000,
      cop_cooling: 3.2,
      id: "pac_1",
      name: "패키지 에어컨-1",
      purpose: EPurpose.COOLING,
    },
    {
      capacity_cooling: 3500,
      cop_cooling: 3.0,
      id: "pac_2",
      name: "패키지 에어컨-2",
      purpose: EPurpose.COOLING,
    },
  ],
  [ESupplySystemType.RADIANT_FLOOR]: [
    {
      id: "rf_1",
      name: "온돌 시스템-1",
      purpose: EPurpose.HEATING,
      source_system_id: "boiler_1",
    },
  ],
  [ESupplySystemType.RADIATOR]: [
    {
      capacity_heating: 2000,
      id: "rad_1",
      name: "라디에이터-1",
      purpose: EPurpose.HEATING,
      source_system_id: "boiler_1",
    },
    {
      capacity_heating: 1500,
      id: "rad_2",
      name: "라디에이터-2",
      purpose: EPurpose.HEATING,
      source_system_id: "boiler_1",
    },
  ],
};

export const MOCK_SOURCE_SYSTEM: TSourceSystemGuiSchema = {
  [ESourceSystemType.ABSORPTION_CHILLER]: [
    {
      boiler_efficiency: 0.85,
      capacity_cooling: 100000,
      cop_cooling: 0.7,
      fuel_type: EFuelType.NATURAL_GAS,
      id: "abs_chiller_1",
      name: "흡수식 냉동기-1",
    },
  ],
  [ESourceSystemType.BOILER]: [
    {
      capacity_heating: 50000,
      efficiency: 0.9,
      fuel_type: EFuelType.NATURAL_GAS,
      id: "boiler_1",
      name: "보일러-1",
    },
    {
      capacity_heating: 30000,
      efficiency: 0.88,
      fuel_type: EFuelType.OIL,
      id: "boiler_2",
      name: "보일러-2",
    },
  ],
  [ESourceSystemType.CHILLER]: [
    {
      capacity_cooling: 80000,
      compressor_type: ECompressorType.SCREW,
      coolingtower_capacity: 100000,
      coolingtower_control: ECoolingTowerControlType.SINGLE_SPEED,
      coolingtower_type: ECoolingTowerType.OPEN,
      cop_cooling: 4.5,
      fuel_type: EFuelType.ELECTRICITY,
      id: "chiller_1",
      name: "냉동기-1",
    },
    {
      capacity_cooling: 60000,
      compressor_type: ECompressorType.TURBO,
      coolingtower_capacity: 75000,
      coolingtower_control: ECoolingTowerControlType.TWO_SPEED,
      coolingtower_type: ECoolingTowerType.CLOSED,
      cop_cooling: 4.2,
      fuel_type: EFuelType.ELECTRICITY,
      id: "chiller_2",
      name: "냉동기-2",
    },
  ],
  [ESourceSystemType.DISTRICT_HEATING]: [],
  [ESourceSystemType.GEOTHERMAL_HEATPUMP]: [
    {
      capacity_cooling: 40000,
      capacity_heating: 45000,
      cop_cooling: 4.8,
      cop_heating: 4.2,
      fuel_type: EFuelType.ELECTRICITY,
      id: "geo_hp_1",
      name: "지열 히트펌프-1",
    },
  ],
  [ESourceSystemType.HEATPUMP]: [
    {
      capacity_cooling: 35000,
      capacity_heating: 40000,
      cop_cooling: 3.8,
      cop_heating: 3.5,
      fuel_type: EFuelType.ELECTRICITY,
      id: "heatpump_1",
      name: "히트펌프-1",
    },
    {
      capacity_cooling: 25000,
      capacity_heating: 28000,
      cop_cooling: 3.6,
      cop_heating: 3.3,
      fuel_type: EFuelType.ELECTRICITY,
      id: "heatpump_2",
      name: "히트펌프-2",
    },
  ],
};

export const MOCK_VENTILATION_SYSTEM: TVentilationSystemState = {
  ventilation_systems: [
    {
      efficiency_cooling: 0.8,
      efficiency_heating: 0.9,
      id: "vent_1",
      name: "환기 설비-1",
    },
    {
      efficiency_cooling: 0.7,
      efficiency_heating: 0.8,
      id: "vent_2",
      name: "환기 설비-2",
    },
    {
      efficiency_cooling: 0.6,
      efficiency_heating: 0.7,
      id: "vent_3",
      name: "환기 설비-3",
    },
    {
      efficiency_cooling: 0.5,
      efficiency_heating: 0.6,
      id: "vent_4",
      name: "환기 설비-4",
    },
  ],
};

export const MOCK_FENESTRATION_CONSTRUCTION: TFenestrationConstructionState = {
  fenestration_constructions: [
    {
      g: 0.5,
      id: "fen_con_1",
      is_transparent: true,
      name: "유리문-1",
      u: 1.5,
    },
    {
      g: 0.2,
      id: "fen_con_2",
      is_transparent: true,
      name: "유리문-2",
      u: 1.1,
    },
    {
      id: "fen_con_3",
      is_transparent: false,
      name: "문-3",
      u: 1.3,
    },
  ],
};

export const MOCK_FENESTRATION: TFenestrationState = {
  // 100개의 랜덤 개구부 데이터를 생성합니다.
  fenestrations: Array.from({ length: 100 }, (_, i) => {
    // 사용할 enum 값들
    const fenestrationTypes = [
      EFenestrationType.DOOR,
      EFenestrationType.GLASS_DOOR,
      EFenestrationType.WINDOW,
    ];
    const fenestrationBlinds = [EFenestrationBlind.SHADE, EFenestrationBlind.VENETIAN];
    // construction_id 후보
    const constructionIds = ["fen_con_1", "fen_con_2", "fen_con_3"];
    // 랜덤 선택 함수
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    // blind는 50% 확률로 null, 아니면 enum 중 하나
    const blind = Math.random() < 0.5 ? null : pick(fenestrationBlinds);
    return {
      area: Number((Math.random() * 49 + 1).toFixed(2)), // 1~50 사이 소수점 2자리
      blind,
      construction_id: pick(constructionIds),
      id: `fen_${i + 1}`,
      name: `랜덤개구부-${i + 1}`,
      type: pick(fenestrationTypes),
    };
  }),
};

export const MOCK_SURFACE_CONSTRUCTION: TSurfaceConstructionState = {
  surface_constructions: [
    {
      id: "surf_1",
      layers: [
        {
          material_id: "material_3",
          thickness: 0.01,
        },
        {
          material_id: "material_3",
          thickness: 0.02,
        },
        {
          material_id: "material_3",
          thickness: 0.03,
        },
      ],
      name: "면 구조체-1",
      type: BUILDING_SURFACE_TYPE.floor,
    },
    {
      id: "surf_2",
      layers: [
        {
          material_id: "material_1",
          thickness: 0.01,
        },
        {
          material_id: "material_1",
          thickness: 0.02,
        },
        {
          material_id: "material_1",
          thickness: 0.03,
        },
        {
          material_id: "material_1",
          thickness: 0.01,
        },
        {
          material_id: "material_1",
          thickness: 0.32,
        },
        {
          material_id: "material_1",
          thickness: 0.43,
        },
      ],
      name: "면 구조체-2",
      type: BUILDING_SURFACE_TYPE.wall,
    },
    {
      id: "surf_3",
      layers: [
        {
          material_id: "material_2",
          thickness: 0.01,
        },
        {
          material_id: "material_2",
          thickness: 0.02,
        },
        {
          material_id: "material_2",
          thickness: 0.03,
        },
        {
          material_id: "material_2",
          thickness: 0.01,
        },
        {
          material_id: "material_2",
          thickness: 0.02,
        },
        {
          material_id: "material_2",
          thickness: 0.03,
        },
        {
          material_id: "material_2",
          thickness: 0.12,
        },
        {
          material_id: "material_2",
          thickness: 0.13,
        },
      ],
      name: "면 구조체-3",
      type: BUILDING_SURFACE_TYPE.wall,
    },
  ],
};

export const MOCK_MATERIALS: TMaterialState = {
  materials: [
    {
      conductivity: 0.7,
      density: 1800,
      id: "material_1",
      name: "벽돌",
      specific_heat: 840,
    },
    {
      conductivity: 1.5,
      density: 2400,
      id: "material_2",
      name: "콘크리트",
      specific_heat: 880,
    },
    {
      conductivity: 1.0,
      density: 2500,
      id: "material_3",
      name: "유리",
      specific_heat: 840,
    },
  ],
};

// export const MOCK_DAY_SCHEDULE: TDayScState = {
//   day_schedule: [
//     {
//       id: nanoid(16),
//       name: "일간 스케줄 1",
//       type: EDayScType.ONOFF,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() =>
//         Math.random() < 0.5 ? 1 : 0,
//       ),
//     },
//     {
//       id: customNanoid(16),
//       name: "일간 스케줄 2",
//       type: EDayScType.REAL,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() => Math.floor(random(0, 9999))),
//     },
//     {
//       id: customNanoid(16),
//       name: "일간 스케줄 3",
//       type: EDayScType.TEMPERATURE,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() => Math.floor(random(5, 35))),
//     },
//     {
//       id: customNanoid(16),
//       name: "일간 스케줄 4",
//       type: EDayScType.REAL,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() => Math.floor(random(0, 9999))),
//     },
//     {
//       id: customNanoid(16),
//       name: "일간 스케줄 5",
//       type: EDayScType.ONOFF,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() =>
//         Math.random() < 0.5 ? 1 : 0,
//       ),
//     },
//     {
//       id: customNanoid(16),
//       name: "일간 스케줄 6",
//       type: EDayScType.TEMPERATURE,
//       values: Array.from({ length: DAY_SCHEDULE_INTERVALS }).map(() => Math.floor(random(5, 35))),
//     },
//   ],
// };
