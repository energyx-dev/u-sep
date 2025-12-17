import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";
import { useVentilationSystemStore } from "@/domain/systems/ventilation/stores/ventilation.store";
import { TEngineSchema } from "@/schemas/engine.schema";

type TEngineSourceSystems = TEngineSchema["building"]["source_systems"];
type TEngineSupplySystems = TEngineSchema["building"]["supply_systems"];
type TEngineVentilationSystems = TEngineSchema["building"]["ventilation_systems"];

type TReturnEngineSystem = {
  sourceSystems: TEngineSourceSystems;
  supplySystems: TEngineSupplySystems;
  ventilationSystems: TEngineVentilationSystems;
};

export const useSystemToEngineFormat = (): TReturnEngineSystem => {
  const supplySystemState = useSupplySystemStore(
    useShallow((state) => ({
      [ESupplySystemType.AIR_HANDLING_UNIT]: state[ESupplySystemType.AIR_HANDLING_UNIT],
      [ESupplySystemType.ELECTRIC_RADIATOR]: state[ESupplySystemType.ELECTRIC_RADIATOR],
      [ESupplySystemType.FAN_COIL_UNIT]: state[ESupplySystemType.FAN_COIL_UNIT],
      [ESupplySystemType.PACKAGED_AIR_CONDITIONER]:
        state[ESupplySystemType.PACKAGED_AIR_CONDITIONER],
      [ESupplySystemType.RADIANT_FLOOR]: state[ESupplySystemType.RADIANT_FLOOR],
      [ESupplySystemType.RADIATOR]: state[ESupplySystemType.RADIATOR],
    })),
  );

  const sourceSystemState = useSourceSystemStore(
    useShallow((state) => ({
      [ESourceSystemType.ABSORPTION_CHILLER]: state[ESourceSystemType.ABSORPTION_CHILLER],
      [ESourceSystemType.BOILER]: state[ESourceSystemType.BOILER],
      [ESourceSystemType.CHILLER]: state[ESourceSystemType.CHILLER],
      [ESourceSystemType.DISTRICT_HEATING]: state[ESourceSystemType.DISTRICT_HEATING],
      [ESourceSystemType.GEOTHERMAL_HEATPUMP]: state[ESourceSystemType.GEOTHERMAL_HEATPUMP],
      [ESourceSystemType.HEATPUMP]: state[ESourceSystemType.HEATPUMP],
    })),
  );

  const { ventilation_systems } = useVentilationSystemStore(
    useShallow((state) => ({
      ventilation_systems: state.ventilation_systems,
    })),
  );

  const supplySystems: TEngineSupplySystems = useMemo(() => {
    return [
      ...supplySystemState[ESupplySystemType.AIR_HANDLING_UNIT].map((system) => ({
        ...system,
        type: ESupplySystemType.AIR_HANDLING_UNIT as const,
      })),
      ...supplySystemState[ESupplySystemType.ELECTRIC_RADIATOR].map((system) => ({
        ...system,
        type: ESupplySystemType.ELECTRIC_RADIATOR as const,
      })),
      ...supplySystemState[ESupplySystemType.FAN_COIL_UNIT].map((system) => ({
        ...system,
        type: ESupplySystemType.FAN_COIL_UNIT as const,
      })),
      ...supplySystemState[ESupplySystemType.PACKAGED_AIR_CONDITIONER].map((system) => ({
        ...system,
        type: ESupplySystemType.PACKAGED_AIR_CONDITIONER as const,
      })),
      ...supplySystemState[ESupplySystemType.RADIANT_FLOOR].map((system) => ({
        ...system,
        type: ESupplySystemType.RADIANT_FLOOR as const,
      })),
      ...supplySystemState[ESupplySystemType.RADIATOR].map((system) => ({
        ...system,
        type: ESupplySystemType.RADIATOR as const,
      })),
    ];
  }, [supplySystemState]);

  const sourceSystems: TEngineSourceSystems = useMemo(() => {
    return [
      ...sourceSystemState[ESourceSystemType.ABSORPTION_CHILLER].map((system) => ({
        ...system,
        type: ESourceSystemType.ABSORPTION_CHILLER as const,
      })),
      ...sourceSystemState[ESourceSystemType.BOILER].map((system) => ({
        ...system,
        type: ESourceSystemType.BOILER as const,
      })),
      ...sourceSystemState[ESourceSystemType.CHILLER].map((system) => ({
        ...system,
        type: ESourceSystemType.CHILLER as const,
      })),
      ...sourceSystemState[ESourceSystemType.DISTRICT_HEATING].map((system) => ({
        ...system,
        type: ESourceSystemType.DISTRICT_HEATING as const,
      })),
      ...sourceSystemState[ESourceSystemType.GEOTHERMAL_HEATPUMP].map((system) => ({
        ...system,
        type: ESourceSystemType.GEOTHERMAL_HEATPUMP as const,
      })),
      ...sourceSystemState[ESourceSystemType.HEATPUMP].map((system) => ({
        ...system,
        type: ESourceSystemType.HEATPUMP as const,
      })),
    ];
  }, [sourceSystemState]);

  return {
    sourceSystems,
    supplySystems,
    ventilationSystems: ventilation_systems,
  };
};
