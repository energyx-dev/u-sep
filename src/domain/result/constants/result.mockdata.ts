export const INIT_PROFILES_DATA = [
  {
    cooling_setpoint_id: null,
    equipment_id: null,
    heating_setpoint_id: null,
    hotwater_id: null,
    hvac_availability_id: "SC-0x0003",
    id: "PF-0x0000",
    lighting_id: "SC-0x0002",
    name: "'''창고'''",
    occupant_id: null,
  },
  {
    cooling_setpoint_id: "SC-0x0001",
    equipment_id: null,
    heating_setpoint_id: "SC-0x0000",
    hotwater_id: null,
    hvac_availability_id: "SC-0x0002",
    id: "PF-0x0001",
    lighting_id: null,
    name: "💕공공기관😊",
    occupant_id: "SCHE-0x000001",
  },
];

export const INIT_PROFILE_COMPONENTS = {
  day_schedules: [
    {
      id: "DS-0x0000",
      name: "공공기관 표준난방",
      type: "temperature",
      values: [
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20,
      ],
    },
    {
      id: "DS-0x0001",
      name: "공공기관 표준냉방",
      type: "temperature",
      values: [
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
        26, 26, 26, 26, 26, 26,
      ],
    },
    {
      id: "DS-0x0002",
      name: "9to6 ON/OFF",
      type: "onoff",
      values: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      id: "DS-0x0003",
      name: "ALL OFF",
      type: "onoff",
      values: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      id: "DS-0x0004",
      name: "ALL ON",
      type: "onoff",
      values: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    },
    {
      id: "DS-0x0005",
      name: "occupancy",
      type: "real",
      values: [
        1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 8, 9, 10, 11, 12, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
        0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    },
  ],
  rulesets: [
    {
      friday_id: null,
      holiday_id: null,
      id: "RS-0x0000",
      monday_id: null,
      name: "공공기관 표준난방",
      saturday_id: null,
      sunday_id: null,
      thursday_id: null,
      tuesday_id: null,
      wednesday_id: null,
      weekdays_id: "DS-0x0000",
      weekends_id: "DS-0x0000",
    },
    {
      friday_id: null,
      holiday_id: null,
      id: "RS-0x0001",
      monday_id: null,
      name: "공공기관 표준냉방",
      saturday_id: null,
      sunday_id: null,
      thursday_id: null,
      tuesday_id: null,
      wednesday_id: null,
      weekdays_id: "DS-0x0001",
      weekends_id: "DS-0x0001",
    },
    {
      friday_id: null,
      holiday_id: "DS-0x0003",
      id: "RS-0x0002",
      monday_id: null,
      name: "공공기관 ON/OFF",
      saturday_id: null,
      sunday_id: null,
      thursday_id: null,
      tuesday_id: null,
      wednesday_id: null,
      weekdays_id: "DS-0x0002",
      weekends_id: "DS-0x0003",
    },
    {
      friday_id: null,
      holiday_id: null,
      id: "RS-0x0003",
      monday_id: null,
      name: "ALL OFF",
      saturday_id: null,
      sunday_id: null,
      thursday_id: null,
      tuesday_id: null,
      wednesday_id: null,
      weekdays_id: "DS-0x0003",
      weekends_id: "DS-0x0003",
    },
    {
      friday_id: null,
      holiday_id: null,
      id: "RS-0x0004",
      monday_id: null,
      name: "사람사람",
      saturday_id: null,
      sunday_id: null,
      thursday_id: null,
      tuesday_id: null,
      wednesday_id: null,
      weekdays_id: "DS-0x0005",
      weekends_id: "DS-0x0005",
    },
  ],
  schedules: [
    {
      id: "SC-0x0000",
      name: "공공기관 표준난방",
      periods: [
        {
          end: "12/31",
          ruleset_id: "RS-0x0000",
          start: "01/01",
        },
      ],
    },
    {
      id: "SC-0x0001",
      name: "공공기관 표준냉방",
      periods: [
        {
          end: "12/31",
          ruleset_id: "RS-0x0001",
          start: "01/01",
        },
      ],
    },
    {
      id: "SC-0x0002",
      name: "공공기관 ON/OFF",
      periods: [
        {
          end: "12/31",
          ruleset_id: "RS-0x0002",
          start: "01/01",
        },
      ],
    },
    {
      id: "SCHE-0x000001",
      name: "아무튼 사람있음",
      periods: [
        {
          end: "12/31",
          ruleset_id: "RS-0x0004",
          start: "01/01",
        },
      ],
    },
    {
      id: "SC-0x0003",
      name: "ALL OFF",
      periods: [
        {
          end: "12/31",
          ruleset_id: "RS-0x0003",
          start: "01/01",
        },
      ],
    },
  ],
};

export const INIT_SUPPLY_SYSTEMS_DATA = [
  {
    id: "SP-0x0000",
    name: "그냥 실내기?",
    source_system_id: "SR-0x0000",
    type: "air_handling_unit",
  },
];

export const INIT_VENTILATION_SYSTEMS_DATA = [
  {
    efficiency_cooling: 0.49,
    efficiency_heating: 0.72,
    id: "AAAAACCCCCDDDDDD",
    name: "HIMPEL HRF-50C",
  },
];

export const INIT_SOURCE_SYSTEMS_DATA = [
  {
    capacity_cooling: 8300.0,
    capacity_heating: 9200,
    cop_cooling: 3.0,
    cop_heating: 3.0,
    fuel_type: "electricity",
    id: "SR-0x0000",
    name: "그냥 $%^&실외기?",
    type: "heatpump",
  },
  {
    capacity_cooling: 8300.0,
    capacity_heating: 9200,
    cop_cooling: 4.3,
    cop_heating: 3.9,
    fuel_type: "electricity",
    id: "SR-0x0001",
    name: "킹★킹 실외기",
    type: "heatpump",
  },
  {
    capacity_heating: null,
    efficiency: 0.91,
    fuel_type: "oil",
    hotwater_supply: true,
    id: "SR-0x0002",
    name: "급탕용 보일러",
    type: "boiler",
  },
];
