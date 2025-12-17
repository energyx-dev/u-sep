import { useShallow } from "zustand/shallow";

import { TEnginePayload } from "@/api/api";
import { useFenestrationConstructionStore } from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { useMaterialStore } from "@/domain/material/stores/material.store";
// import {
//   INIT_PROFILE_COMPONENTS,
//   INIT_PROFILES_DATA,
// } from "@/domain/result/constants/result.mockdata";
import { useBuildingToEngineFormat } from "@/domain/result/hooks/useBuildingToEngineFormat";
import { useSurfaceConstructionStore } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { ERemodelingType } from "@/enums/ERemodelingType";

export const useGenerateRequestData = (): TEnginePayload => {
  const beforeBuilding = useBuildingToEngineFormat(ERemodelingType.BEFORE);
  const afterBuilding = useBuildingToEngineFormat(ERemodelingType.AFTER);

  const { fenestration_constructions } = useFenestrationConstructionStore();

  const { materials } = useMaterialStore(
    useShallow((state) => ({
      materials: state.materials,
    })),
  );

  const { surface_constructions } = useSurfaceConstructionStore(
    useShallow((state) => ({
      surface_constructions: state.surface_constructions,
    })),
  );

  return {
    after: {
      item: {
        building: afterBuilding,
        fenestration_constructions: fenestration_constructions,
        materials,
        // profile_components: INIT_PROFILE_COMPONENTS,
        // profiles: INIT_PROFILES_DATA,
        surface_constructions,
      },
      name: "리모델링 후",
    },
    before: {
      item: {
        building: beforeBuilding,
        fenestration_constructions: fenestration_constructions,
        materials,
        // profile_components: INIT_PROFILE_COMPONENTS,
        // profiles: INIT_PROFILES_DATA,
        surface_constructions,
      },
      name: "리모델링 전",
    },
  };
};
