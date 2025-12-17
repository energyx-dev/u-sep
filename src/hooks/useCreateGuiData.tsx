import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useBuildingInfoStore } from "@/domain/basic-info/stores/building.store";
import { useFenestrationStore } from "@/domain/fenestration/stores/fenestration.store";
import { useFenestrationConstructionStore } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { useMaterialStore } from "@/domain/material/stores/material.store";
import { useSurfaceConstructionStore } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { useLightningDensityStore } from "@/domain/systems/lightning/stores/lightning-density.store";
import { useLightningStore } from "@/domain/systems/lightning/stores/lightning.store";
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";
import { useVentilationSystemStore } from "@/domain/systems/ventilation/stores/ventilation.store";
import { TGuiSchema } from "@/schemas/gui.schema";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";

export const useCreateGuiData = () => {
  const { buildingInfo: buildingInfoState } = useBuildingInfoStore(
    useShallow((state) => ({
      buildingInfo: state.buildingInfo,
    })),
  );

  const beforeBuildingGeometryStore = useBeforeBuildingGeometryStore(
    useShallow((state) => ({
      buildingFloors: state.buildingFloors,
      photovoltaic_systems: state.photovoltaic_systems,
      version: state.version,
    })),
  );

  const afterBuildingGeometryStore = useAfterBuildingGeometryStore(
    useShallow((state) => ({
      buildingFloors: state.buildingFloors,
      photovoltaic_systems: state.photovoltaic_systems,
      version: state.version,
    })),
  );

  const sourceSystemState = useSourceSystemStore(
    useShallow((state) => ({
      [ESourceSystemType.ABSORPTION_CHILLER]: state.absorption_chiller,
      [ESourceSystemType.BOILER]: state.boiler,
      [ESourceSystemType.CHILLER]: state.chiller,
      [ESourceSystemType.DISTRICT_HEATING]: state.district_heating,
      [ESourceSystemType.GEOTHERMAL_HEATPUMP]: state.geothermal_heatpump,
      [ESourceSystemType.HEATPUMP]: state.heatpump,
    })),
  );

  const supplySystemState = useSupplySystemStore(
    useShallow((state) => ({
      [ESupplySystemType.AIR_HANDLING_UNIT]: state.air_handling_unit,
      [ESupplySystemType.ELECTRIC_RADIATOR]: state.electric_radiator,
      [ESupplySystemType.FAN_COIL_UNIT]: state.fan_coil_unit,
      [ESupplySystemType.PACKAGED_AIR_CONDITIONER]: state.packaged_air_conditioner,
      [ESupplySystemType.RADIANT_FLOOR]: state.radiant_floor,
      [ESupplySystemType.RADIATOR]: state.radiator,
    })),
  );

  const { ventilation_systems: ventilationSystemState } = useVentilationSystemStore(
    useShallow((state) => ({
      ventilation_systems: state.ventilation_systems,
    })),
  );

  const { materials: materialState } = useMaterialStore(
    useShallow((state) => ({
      materials: state.materials,
    })),
  );

  const { surface_constructions: surfaceConstructionState } = useSurfaceConstructionStore(
    useShallow((state) => ({
      surface_constructions: state.surface_constructions,
    })),
  );

  const { fenestration_constructions: fenestrationConstructionState } =
    useFenestrationConstructionStore(
      useShallow((state) => ({
        fenestration_constructions: state.fenestration_constructions,
      })),
    );

  const { fenestrations: fenestrationState } = useFenestrationStore(
    useShallow((state) => ({
      fenestrations: state.fenestrations,
    })),
  );

  const { lightning: lightningState } = useLightningStore(
    useShallow((state) => ({
      lightning: state.lightning,
    })),
  );

  const { density: lightningDensityState } = useLightningDensityStore(
    useShallow((state) => ({
      density: state.density,
    })),
  );

  const { photovoltaic_systems: photovoltaicSystemState } = useRenewableStore(
    useShallow((state) => ({
      photovoltaic_systems: state.photovoltaic_systems,
    })),
  );

  const guiData: TGuiSchema = useMemo(() => {
    return {
      afterBuilding: afterBuildingGeometryStore,
      beforeBuilding: beforeBuildingGeometryStore,
      buildingInfo: buildingInfoState,
      fenestrationConstructions: fenestrationConstructionState,
      fenestrations: fenestrationState,
      lightning: lightningState,
      lightningDensity: lightningDensityState,
      materials: materialState,
      photovoltaicSystems: photovoltaicSystemState,
      sourceSystems: sourceSystemState,
      supplySystems: supplySystemState,
      surfaceConstructions: surfaceConstructionState,
      ventilationSystems: ventilationSystemState,
    } satisfies TGuiSchema;
  }, [
    afterBuildingGeometryStore,
    beforeBuildingGeometryStore,
    buildingInfoState,
    fenestrationConstructionState,
    fenestrationState,
    materialState,
    photovoltaicSystemState,
    sourceSystemState,
    supplySystemState,
    lightningState,
    lightningDensityState,
    surfaceConstructionState,
    ventilationSystemState,
  ]);

  return { guiData };
};
