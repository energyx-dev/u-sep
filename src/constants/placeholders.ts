import { BUILDING_SURFACE_TYPE } from "@/domain/shape-info/schemas/surface/surface.enum";

// 기본 정보 페이지
export const PLACEHOLDERS = {
  BUILDING_INFO: {
    ADDRESS_DISTRICT: "",
    ADDRESS_REGION: "선택하세요.",
    DETAIL_ADDRESS: "입력하세요.",
    NAME: "입력하세요.(50자 이내)",
    NORTH_AXIS: "예: 90.23",
    VINTAGE: "일자를 선택하세요.",
  },
  elements: {
    fenestration: {
      area: "예: 2.50",
      blind: "선택하세요.",
      construction_id: "선택하세요.",
      name: "입력하세요.",
      type: "선택하세요.",
    },
    fenestration_construction: {
      g: "예: 0.45",
      is_transparent: "선택하세요.",
      name: "입력하세요.",
      u: "예: 2.6",
    },
    material: {
      conductivity: "예: 1.25",
      density: "예: 2,400",
      name: "입력하세요.",
      specific_heat: "예: 900",
    },
    surface_construction: {
      layers: {
        material_id: "선택하세요.",
        thickness: "예: 3.0",
      },
      name: "입력하세요.",
    },
  },
  FLOOR: {
    FLOOR_NAME: "예: 1층",
  },
  SURFACE: {
    ADJACENT_ZONE_ID: "선택하세요.",
    AREA: "예: 20.45",
    AZIMUTH: "예: 0(북), 90(동), 180(남), 270(서)",
    BOUNDARY_CONDITION: "선택하세요.",
    COOLROOF_REFLECTANCE: "예: 85",
    HAS_COOLROOF: "선택하세요.",
    NAME: {
      [BUILDING_SURFACE_TYPE.ceiling]: "입력하세요.",
      [BUILDING_SURFACE_TYPE.floor]: "입력하세요.",
      [BUILDING_SURFACE_TYPE.wall]: "입력하세요.",
    },
  },
  systems: {
    lightning: {
      density: "예: 9.23",
      electric_consumption: "예: 1,500",
      name: "입력하세요.",
    },
    photovoltaic: {
      area: "예: 15.45",
      azimuth: "예: 0(북향), 90(서향)",
      efficiency: "예: 22",
      name: "입력하세요.",
      tilt: "예: 0(수평), 90(수직)",
    },
    source_system: {
      boiler_efficiency: "예: 85",
      capacity_cooling: "예: 5,000",
      capacity_heating: "예: 6,000",
      compressor_type: "선택하세요.",
      coolingtower_capacity: "예: 12,000",
      coolingtower_control: "선택하세요.",
      coolingtower_type: "선택하세요.",
      cop_cooling: "예: 3.0",
      cop_heating: "예: 3.0",
      efficiency: "예: 85",
      fuel_type: "선택하세요.",
      hotwater_supply: "선택하세요.",
      name: "입력하세요.",
    },
    supply_system: {
      capacity_cooling: "예: 4,500",
      capacity_heating: "예: 4,000",
      cop_cooling: "예: 3.0",
      name: "입력하세요.",
      purpose: "선택하세요.",
      source_system_id: "선택하세요.",
    },
    ventilation_system: {
      efficiency_cooling: "예: 45",
      efficiency_heating: "예: 70",
      name: "입력하세요.",
    },
  },
  ZONE: {
    HEIGHT: "예: 2.41",
    INFILTRATION: "예: 1.31",
    NAME: "입력하세요.",
    PROFILE: "선택하세요.",
  },
};
