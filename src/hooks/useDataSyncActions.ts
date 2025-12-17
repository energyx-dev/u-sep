import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

import { TBuildingState, useBuildingInfoStore } from "@/domain/basic-info/stores/building.store";
import { TVersionGuiSchema } from "@/domain/building-geometry/schemas/version-name.schema";
import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import {
  TFenestrationState,
  useFenestrationStore,
} from "@/domain/fenestration/stores/fenestration.store";
import { TFenestrationConstructionEngineAndGuiSchema } from "@/domain/fenestrationConstruction/schemas/fenestration-construction.schema";
import {
  TFenestrationConstructionState,
  useFenestrationConstructionStore,
} from "@/domain/fenestrationConstruction/stores/fenestrationConstruction.store";
import { TMaterialEngineAndGuiSchema } from "@/domain/material/schemas/material.schema";
import { TMaterialState, useMaterialStore } from "@/domain/material/stores/material.store";
// import { TDayScState, useDayScStore } from "@/domain/profile/day-schedule/day-sc.store";
// import { TDaySc } from "@/domain/profile/day-schedule/schemas/day-sc-store.schema";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import {
  TSurfaceConstructionState,
  useSurfaceConstructionStore,
} from "@/domain/surface-constructions/stores/surface-constructions.store";
import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import {
  TLightningDensityState,
  useLightningDensityStore,
} from "@/domain/systems/lightning/stores/lightning-density.store";
import {
  TLightningState,
  useLightningStore,
} from "@/domain/systems/lightning/stores/lightning.store";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { useRenewableStore } from "@/domain/systems/renewable/stores/renewable.store";
import { TSourceSystemGuiSchema } from "@/domain/systems/source/schemas/source-system.schema";
import { useSourceSystemStore } from "@/domain/systems/source/stores/sourceSystem.store";
import { TSupplySystemGuiSchema } from "@/domain/systems/supply/schemas/supply-system.schema";
import { useSupplySystemStore } from "@/domain/systems/supply/stores/supplySystem.store";
import { TVentilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import {
  TVentilationSystemState,
  useVentilationSystemStore,
} from "@/domain/systems/ventilation/stores/ventilation.store";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useBuildingGeometryStore } from "@/hooks/useBuildingGeometryStore";
import { TRenewableSystemState } from "@/store/building-geometry.store";
import { useFileStore } from "@/store/file.store";
import { EFileType } from "@/store/file.type";
import { TTemplateReference } from "@/types/template.types";

export const useDataSyncActions = (explicitRemodelingType?: ERemodelingType) => {
  const { fileMetadata, setFileMetadataStore } = useFileStore(
    useShallow((state) => ({
      fileMetadata: state.fileMetadata,
      setFileMetadataStore: state.setFileMetadataStore,
    })),
  );

  // 리모델링 타입에 따라 다른 store의 액션함수를 가져옴
  const {
    addPhotovoltaicSystemStore: addPhotovoltaicSystemStore,
    resetBuildingFloorsStore: resetShapeInfoStore,
    resetRenewableSystemStore: resetPhotovoltaicSystemStore,
    resetVersionStore,
    setBuildingFloorsStore: setShapeInfoStore,
    setRenewableSystemStore: setRenewableSystemStore,
    setVersionStore,
    syncPhotovoltaicSystemStore: syncPhotovoltaicSystemStore,
  } = useBuildingGeometryStore(explicitRemodelingType);

  const { buildingResetStore, setBuildingInfoStore } = useBuildingInfoStore(
    useShallow((state) => ({
      buildingResetStore: state.buildingResetStore,
      setBuildingInfoStore: state.setBuildingInfoStore,
    })),
  );

  const {
    addSupplySystemStore,
    setSupplySystemStore,
    supplySystemResetStore,
    syncSupplySystemStore,
  } = useSupplySystemStore(
    useShallow((state) => ({
      addSupplySystemStore: state.addSupplySystemStore,
      setSupplySystemStore: state.setSupplySystemStore,
      supplySystemResetStore: state.supplySystemResetStore,
      syncSupplySystemStore: state.syncSupplySystemStore,
    })),
  );

  const {
    addSourceSystemStore,
    resetSourceSystemStore,
    setSourceSystemStore,
    syncSourceSystemStore,
  } = useSourceSystemStore(
    useShallow((state) => ({
      addSourceSystemStore: state.addSourceSystemStore,
      resetSourceSystemStore: state.resetSourceSystemStore,
      setSourceSystemStore: state.setSourceSystemStore,
      syncSourceSystemStore: state.syncSourceSystemStore,
    })),
  );

  const {
    addVentilationSystemStore,
    resetVentilationSystemStore,
    setVentilationSystemStore,
    syncVentilationSystemStore,
  } = useVentilationSystemStore(
    useShallow((state) => ({
      addVentilationSystemStore: state.addVentilationSystemStore,
      resetVentilationSystemStore: state.resetVentilationSystemStore,
      setVentilationSystemStore: state.setVentilationSystemStore,
      syncVentilationSystemStore: state.syncVentilationSystemStore,
    })),
  );

  const { addMaterialStore, resetMaterialStore, setMaterialStore, syncMaterialStore } =
    useMaterialStore(
      useShallow((state) => ({
        addMaterialStore: state.addMaterialStore,
        resetMaterialStore: state.resetMaterialStore,
        setMaterialStore: state.setMaterialStore,
        syncMaterialStore: state.syncMaterialStore,
      })),
    );

  const {
    addSurfaceConstructionStore,
    resetSurfaceConstructionStore,
    setSurfaceConstructionStore,
    syncSurfaceConstructionStore,
  } = useSurfaceConstructionStore(
    useShallow((state) => ({
      addSurfaceConstructionStore: state.addSurfaceConstructionStore,
      resetSurfaceConstructionStore: state.resetSurfaceConstructionStore,
      setSurfaceConstructionStore: state.setSurfaceConstructionStore,
      syncSurfaceConstructionStore: state.syncSurfaceConstructionStore,
    })),
  );

  const { addLightningStore, resetLightningStore, setLightningStore, syncLightningStore } =
    useLightningStore(
      useShallow((state) => ({
        addLightningStore: state.addLightningStore,
        resetLightningStore: state.resetLightningStore,
        setLightningStore: state.setLightningStore,
        syncLightningStore: state.syncLightningStore,
      })),
    );

  const {
    addLightningDensityStore,
    resetLightningDensityStore,
    setLightningDensityStore,
    syncLightningDensityStore,
  } = useLightningDensityStore(
    useShallow((state) => ({
      addLightningDensityStore: state.addLightningDensityStore,
      resetLightningDensityStore: state.resetLightningDensityStore,
      setLightningDensityStore: state.setLightningDensityStore,
      syncLightningDensityStore: state.syncLightningDensityStore,
    })),
  );

  const {
    addFenestrationConstructionStore,
    resetFenestrationConstructionStore,
    setFenestrationConstructionStore,
    syncFenestrationConstructionStore,
  } = useFenestrationConstructionStore(
    useShallow((state) => ({
      addFenestrationConstructionStore: state.addFenestrationConstructionStore,
      resetFenestrationConstructionStore: state.resetFenestrationConstructionStore,
      setFenestrationConstructionStore: state.setFenestrationConstructionStore,
      syncFenestrationConstructionStore: state.syncFenestrationConstructionStore,
    })),
  );

  const {
    addFenestrationStore,
    resetFenestrationStore,
    setFenestrationStore,
    syncFenestrationStore,
  } = useFenestrationStore(
    useShallow((state) => ({
      addFenestrationStore: state.addFenestrationStore,
      resetFenestrationStore: state.resetFenestrationStore,
      setFenestrationStore: state.setFenestrationStore,
      syncFenestrationStore: state.syncFenestrationStore,
    })),
  );

  // const { addDayScStore, deleteDayScStore, resetDayScStore, setDayScStore, updateDayScStore } =
  //   useDayScStore(
  //     useShallow((state) => ({
  //       addDayScStore: state.addDayScStore,
  //       deleteDayScStore: state.deleteDayScStore,
  //       resetDayScStore: state.resetDayScStore,
  //       setDayScStore: state.setDayScStore,
  //       updateDayScStore: state.updateDayScStore,
  //     })),
  //   );

  const {
    addPhotovoltaicSystemStore: addPhotovoltaicSystemStoreRenewable,
    resetRenewableSystemStore: resetRenewableSystemStoreRenewable,
    syncPhotovoltaicSystemStore: syncPhotovoltaicSystemStoreRenewable,
  } = useRenewableStore(
    useShallow((state) => ({
      addPhotovoltaicSystemStore: state.addPhotovoltaicSystemStore,
      resetRenewableSystemStore: state.resetRenewableSystemStore,
      syncPhotovoltaicSystemStore: state.syncPhotovoltaicSystemStore,
    })),
  );

  const fileModifyTrigger = useCallback(() => {
    if (fileMetadata?.type === EFileType.COMPLETED) {
      setFileMetadataStore({
        ...fileMetadata,
        type: EFileType.IN_PROGRESS,
      });
    }
  }, [fileMetadata, setFileMetadataStore]);

  return {
    // 파일 관리
    setFileMetadata: setFileMetadataStore,
    // 건물 정보
    setBuildingInfo: (data: TBuildingState["buildingInfo"]) => {
      setBuildingInfoStore(data);
      fileModifyTrigger();
    },
    setBuildingReset: buildingResetStore,
    // 버전 정보
    setVersion: (data: TVersionGuiSchema) => {
      setVersionStore(data);
      fileModifyTrigger();
    },
    setVersionReset: resetVersionStore,
    // 형상 정보
    setShapeInfo: (data: TFloorGuiSchema[]) => {
      setShapeInfoStore(data);
      fileModifyTrigger();
    },
    setShapeInfoReset: resetShapeInfoStore,
    // 생산 설비
    addSourceSystem: (
      key: keyof TSourceSystemGuiSchema,
      newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
    ) => {
      addSourceSystemStore(key, newList);
      fileModifyTrigger();
    },
    setSourceSystem: (data: TSourceSystemGuiSchema) => {
      setSourceSystemStore(data);
      fileModifyTrigger();
    },
    setSourceSystemReset: resetSourceSystemStore,
    syncSourceSystem: (
      key: keyof TSourceSystemGuiSchema,
      newList: TSourceSystemGuiSchema[keyof TSourceSystemGuiSchema],
    ) => {
      syncSourceSystemStore(key, newList);
      fileModifyTrigger();
    },
    // 공급 설비
    addSupplySystem: (
      key: keyof TSupplySystemGuiSchema,
      newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
    ) => {
      addSupplySystemStore(key, newList);
      fileModifyTrigger();
    },
    setSupplySystem: (data: TSupplySystemGuiSchema) => {
      setSupplySystemStore(data);
      fileModifyTrigger();
    },
    setSupplySystemReset: supplySystemResetStore,
    syncSupplySystem: (
      key: keyof TSupplySystemGuiSchema,
      newList: TSupplySystemGuiSchema[keyof TSupplySystemGuiSchema],
    ) => {
      syncSupplySystemStore(key, newList);
      fileModifyTrigger();
    },
    // 환기 설비
    addVentilationSystem: (systemList: TVentilationEngineAndGuiSchema[]) => {
      addVentilationSystemStore(systemList);
      fileModifyTrigger();
    },
    setVentilationSystem: (state: TVentilationSystemState) => {
      setVentilationSystemStore(state);
      fileModifyTrigger();
    },
    setVentilationSystemReset: resetVentilationSystemStore,
    syncVentilationSystem: (systemList: TVentilationEngineAndGuiSchema[]) => {
      syncVentilationSystemStore(systemList);
      fileModifyTrigger();
    },
    // 재료 정보
    addMaterial: (systemList: TMaterialEngineAndGuiSchema[]) => {
      addMaterialStore(systemList);
      fileModifyTrigger();
    },
    setMaterial: (state: TMaterialState) => {
      setMaterialStore(state);
      fileModifyTrigger();
    },
    setMaterialReset: resetMaterialStore,
    syncMaterial: (systemList: TMaterialEngineAndGuiSchema[]) => {
      syncMaterialStore(systemList);
      fileModifyTrigger();
    },
    // 태양광 발전 설비
    addPhotovoltaicSystem: (templateList: TTemplateReference[]) => {
      addPhotovoltaicSystemStore(templateList);
      fileModifyTrigger();
    },
    setPhotovoltaicSystemReset: resetPhotovoltaicSystemStore,
    setRenewableSystem: (state: TRenewableSystemState) => {
      setRenewableSystemStore(state);
      fileModifyTrigger();
    },
    syncPhotovoltaicSystem: (templateList: TTemplateReference[]) => {
      syncPhotovoltaicSystemStore(templateList);
      fileModifyTrigger();
    },
    // 면 구조체
    addSurfaceConstruction: (data: TSurfaceConstructionEngineAndGuiSchema[]) => {
      addSurfaceConstructionStore(data);
      fileModifyTrigger();
    },
    setSurfaceConstruction: (state: TSurfaceConstructionState) => {
      setSurfaceConstructionStore(state);
      fileModifyTrigger();
    },
    setSurfaceConstructionReset: resetSurfaceConstructionStore,
    syncSurfaceConstruction: (data: TSurfaceConstructionEngineAndGuiSchema[]) => {
      syncSurfaceConstructionStore(data);
      fileModifyTrigger();
    },
    // 개구부 구조체
    addFenestrationConstruction: (systemList: TFenestrationConstructionEngineAndGuiSchema[]) => {
      addFenestrationConstructionStore(systemList);
      fileModifyTrigger();
    },
    setFenestrationConstruction: (state: TFenestrationConstructionState) => {
      setFenestrationConstructionStore(state);
      fileModifyTrigger();
    },
    setFenestrationConstructionReset: resetFenestrationConstructionStore,
    syncFenestrationConstruction: (systemList: TFenestrationConstructionEngineAndGuiSchema[]) => {
      syncFenestrationConstructionStore(systemList);
      fileModifyTrigger();
    },
    // 개구부
    addFenestration: (systemList: TFenestrationEngineAndGuiSchema[]) => {
      addFenestrationStore(systemList);
      fileModifyTrigger();
    },
    setFenestration: (state: TFenestrationState) => {
      setFenestrationStore(state);
      fileModifyTrigger();
    },
    setFenestrationReset: resetFenestrationStore,
    syncFenestration: (systemList: TFenestrationEngineAndGuiSchema[]) => {
      syncFenestrationStore(systemList);
      fileModifyTrigger();
    },
    // 일간 스케줄
    // addDaySc: (data: TDaySc) => {
    //   addDayScStore(data);
    //   fileModifyTrigger();
    // },
    // deleteDaySc: (id: string) => {
    //   deleteDayScStore(id);
    //   fileModifyTrigger();
    // },
    // setDaySc: (state: TDayScState) => {
    //   setDayScStore(state);
    //   fileModifyTrigger();
    // },
    // setDayScReset: resetDayScStore,
    // updateDaySc: (id: string, data: TDaySc) => {
    //   updateDayScStore(id, data);
    //   fileModifyTrigger();
    // },
    // 신재생 설비
    addPhotovoltaicSystemRenewable: (systemList: TPhotovoltaicSystemEngineAndGuiSchema[]) => {
      addPhotovoltaicSystemStoreRenewable(systemList);
      fileModifyTrigger();
    },
    setRenewableSystemReset: resetRenewableSystemStoreRenewable,
    syncPhotovoltaicSystemRenewable: (systemList: TPhotovoltaicSystemEngineAndGuiSchema[]) => {
      syncPhotovoltaicSystemStoreRenewable(systemList);
      fileModifyTrigger();
    },
    // 조명
    addLightning: (systemList: TLightningGuiSchema[]) => {
      addLightningStore(systemList);
      fileModifyTrigger();
    },
    setLightning: (state: TLightningState) => {
      setLightningStore(state);
      fileModifyTrigger();
    },
    setLightningReset: resetLightningStore,
    syncLightning: (systemList: TLightningGuiSchema[]) => {
      syncLightningStore(systemList);
      fileModifyTrigger();
    },
    // 조명 밀도
    addLightningDensity: (systemList: TLightningDensityGuiSchema[]) => {
      addLightningDensityStore(systemList);
      fileModifyTrigger();
    },
    setLightningDensity: (state: TLightningDensityState) => {
      setLightningDensityStore(state);
      fileModifyTrigger();
    },
    setLightningDensityReset: resetLightningDensityStore,
    syncLightningDensity: (systemList: TLightningDensityGuiSchema[]) => {
      syncLightningDensityStore(systemList);
      fileModifyTrigger();
    },
  };
};
