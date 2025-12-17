export const VALIDATION_ERROR_MESSAGES = {
  building_info: {
    addressDistrict: "지역 구분 (시/군/구)를 선택하세요.",
    addressRegion: "지역 (시/도)를 선택하세요.",
    detailAddress: "상세 주소는 50자 이내로 입력 가능합니다.",
    name: "건물 이름은 50자 이내로 입력 가능합니다.",
    north_axis: "방위각은 0 이상 360의 미만 값을 입력 가능합니다.",
    vintage: "허가일자를 선택하세요.",
  },
  elements: {
    fenestration: {
      area: "개구부 면적은 0 이상의 값을 입력 가능합니다.",
      blind: "블라인드 종류를 선택해 주세요.",
      construction_id: "개구부 구조체를 선택해 주세요.",
      name: "개구부 이름은 50자 이내로 입력 가능합니다.",
      type: "개구부 종류를 선택해 주세요.",
    },
    fenestration_construction: {
      g: "태양열취득계수는 0 초과 1 이하의 값을 입력 가능합니다.",
      is_transparent: "투명 여부를 선택해 주세요.",
      name: "구조체 이름은 50자 이내로 입력 가능합니다.",
      u: "열관류율은 0 초과의 값을 입력 가능합니다.",
    },
    material: {
      conductivity: "열전도율은 0 초과의 값을 입력 가능합니다.",
      density: "밀도는 0 초과의 값을 입력 가능합니다.",
      name: "재료 이름은 50자 이내로 입력 가능합니다.",
      specific_heat: "비열은 100 초과의 값을 입력 가능합니다.",
    },
    surface_construction: {
      layers: {
        material_id: "재료를 선택해 주세요.",
        thickness: "두께는 3 이상의 값을 입력 가능합니다.",
      },
      name: "면 구조체 이름은 50자 이내로 입력 가능합니다.",
    },
  },
  shape_info: {
    floor: {
      floor_name: "층 이름은 50자 이내로 입력 가능합니다.",
    },
    surface: {
      adjacent_zone_id: "인접 관계를 선택해 주세요.",
      area: "면적은 0 초과의 값을 입력 가능합니다.",
      azimuth: "벽 방향은 0 이상 360 미만의 값을 입력 가능합니다.",
      boundary_condition: "경계 조건을 선택해 주세요.",
      coolroof_reflectance: "쿨루프 반사율은 0 이상 100 이하의 값을 입력 가능합니다.",
      name: "면 이름은 50자 이내로 입력 가능합니다.",
    },
    version: {
      name: "버전 이름은 50자 이내로 입력 가능합니다.",
    },
    zone: {
      height: "천장고는 0 초과의 값을 입력 가능합니다.",
      infiltration: "침기율은 0 이상의 값을 입력 가능합니다.",
      lightning: "조명을 선택해 주세요.",
      name: "존 이름은 50자 이내로 입력 가능합니다.",
      profile: "용도를 선택해 주세요.",
    },
  },
  systems: {
    lightning: {
      density: "조명밀도는 0 이상의 값을 입력 가능합니다.",
      electric_consumption: "조명 소비전력은 0 초과의 값을 입력 가능합니다.",
      name: "조명 이름은 50자 이내로 입력 가능합니다.",
    },
    photovoltaic: {
      area: "(BI)PV패널 면적은 0 초과의 값을 입력 가능합니다.",
      azimuth: "(BI)PV패널 방위각은 0 이상 360 미만의 값을 입력 가능합니다.",
      efficiency: "(BI)PV패널 효율은 0 초과 100 미만의 값을 입력 가능합니다.",
      name: "신재생 설비 이름은 50자 이내로 입력 가능합니다.",
      tilt: "(BI)PV패널 경사각은 0 이상 90 이하의 값을 입력 가능합니다.",
    },
    source_system: {
      boiler_efficiency: "보일러 효율은 0 초과 100 미만의 값을 입력 가능합니다.",
      capacity_cooling: "냉방 용량은 0 초과의 값을 입력 가능합니다.",
      capacity_heating: "난방 용량은 0 초과의 값을 입력 가능합니다.",
      compressor_type: "압축기 방식을 선택해 주세요.",
      coolingtower_capacity: "냉각탑 용량은 0 초과의 값을 입력 가능합니다.",
      coolingtower_control: "냉각탑 제어방식을 선택해 주세요.",
      coolingtower_type: "냉각탑 종류를 선택해 주세요.",
      cop_cooling: "냉방 COP는 0 초과의 값을 입력 가능합니다.",
      cop_heating: "난방 COP는 0 초과의 값을 입력 가능합니다.",
      efficiency: "효율은 0 초과 100 미만의 값을 입력 가능합니다.",
      fuel_type: "연료 종류를 선택해 주세요.",
      hotwater_supply: "급탕 여부를 선택해 주세요.",
      name: "설비 이름은 50자 이내로 입력 가능합니다.",
    },
    supply_system: {
      capacity_cooling: "냉방 용량은 0 초과의 값을 입력 가능합니다.",
      capacity_heating: "난방 용량은 0 초과의 값을 입력 가능합니다.",
      cop_cooling: "냉방 COP는 0 초과의 값을 입력 가능합니다.",
      name: "설비 이름은 50자 이내로 입력 가능합니다.",
      purpose: "용도를 선택해 주세요.",
      source_system_id: "생산 설비를 선택해 주세요.",
    },
    ventilation_system: {
      efficiency_cooling: "효율은 0 초과 100 미만의 값을 입력 가능합니다.",
      efficiency_heating: "효율은 0 초과 100 미만의 값을 입력 가능합니다.",
      name: "환기 설비 이름은 50자 이내로 입력 가능합니다.",
    },
  },
};
