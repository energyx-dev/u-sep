import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

import { getInitialBuildingState } from "@/domain/basic-info/stores/building.store";
import { useResultStore } from "@/domain/result/stores/result.store";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TZoneGuiSchema } from "@/domain/shape-info/schemas/zone/zone.schema";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useCreateGuiData } from "@/hooks/useCreateGuiData";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import { openJsonFile, saveJsonFile } from "@/lib/file-helper";
import { TBuildingGeometryGuiSchema, TGuiSchema } from "@/schemas/gui.schema";
import { useDebugStore } from "@/store/debug.store";
import { useFileStore } from "@/store/file.store";
import { EFileType } from "@/store/file.type";

const NEW_FILE_NAME = "새 파일";

// electron 파일 저장, 열기
export const useFileManage = () => {
  const isElectron = import.meta.env.MODE === "electron";

  const {
    // setDayScReset,
    setBuildingReset,
    setFenestrationConstructionReset,
    setFenestrationReset,
    setFileMetadata,
    setLightningReset,
    setMaterialReset,
    setRenewableSystemReset,
    setSourceSystemReset,
    setSupplySystemReset,
    setSurfaceConstructionReset,
    setVentilationSystemReset,
  } = useDataSyncActions();

  const {
    setPhotovoltaicSystemReset: setBeforePhotovoltaicSystemReset,
    setShapeInfoReset: setBeforeShapeInfoReset,
    setVersionReset: setBeforeVersionReset,
  } = useDataSyncActions(ERemodelingType.BEFORE);
  const {
    setPhotovoltaicSystemReset: setAfterPhotovoltaicSystemReset,
    setShapeInfoReset: setAfterShapeInfoReset,
    setVersionReset: setAfterVersionReset,
  } = useDataSyncActions(ERemodelingType.AFTER);

  const fileMetadata = useFileStore((state) => state.fileMetadata);

  const isDirty = useMemo(() => {
    return fileMetadata?.type === EFileType.IN_PROGRESS;
  }, [fileMetadata]);

  const setResult = useResultStore((state) => state.setResult);

  const { guiData } = useCreateGuiData();

  const { setIsDebuggingMode } = useDebugStore(
    useShallow((state) => ({
      setIsDebuggingMode: state.setIsDebuggingMode,
    })),
  );

  const newFile = useCallback(() => {
    setBuildingReset({ ...getInitialBuildingState(), isFileLoaded: true });
    setAfterShapeInfoReset();
    setBeforeShapeInfoReset();
    setBeforeVersionReset();
    setAfterVersionReset();
    setLightningReset();
    setSourceSystemReset();
    setSupplySystemReset();
    setSurfaceConstructionReset();
    setVentilationSystemReset();
    setBeforePhotovoltaicSystemReset();
    setAfterPhotovoltaicSystemReset();
    setFenestrationConstructionReset();
    setFenestrationReset();
    setMaterialReset();
    setRenewableSystemReset();
    setFileMetadata({
      name: NEW_FILE_NAME,
      type: EFileType.COMPLETED,
    });

    // 분석결과 다시보기 비활성화 처리
    setResult(undefined);

    // 새파일 -> 디버깅 모드 해제
    setIsDebuggingMode(false);
  }, [
    setBuildingReset,
    setAfterShapeInfoReset,
    setBeforeShapeInfoReset,
    setSourceSystemReset,
    setSupplySystemReset,
    setSurfaceConstructionReset,
    setVentilationSystemReset,
    setBeforePhotovoltaicSystemReset,
    setAfterPhotovoltaicSystemReset,
    setFenestrationConstructionReset,
    setFenestrationReset,
    setMaterialReset,
    setRenewableSystemReset,
    setLightningReset,
    setFileMetadata,
    setResult,
    setIsDebuggingMode,
  ]);

  const loadFile = useCallback(
    async (successCallback?: () => void) => {
      if (!isElectron) return;

      const fileData = await openJsonFile<TGuiSchema>();

      if (fileData) {
        // TODO 파일 데이터 검증 필요 (zod schema를 사용하는 방법 고민)
        const { data, name, path } = fileData;
        const {
          afterBuilding,
          beforeBuilding,
          buildingInfo,
          // daySchedules,
          fenestrationConstructions,
          fenestrations,
          lightning,
          materials,
          photovoltaicSystems,
          sourceSystems,
          supplySystems,
          surfaceConstructions,
          ventilationSystems,
        } = data;
        setBuildingReset({ buildingInfo: buildingInfo, isFileLoaded: true });
        setAfterShapeInfoReset(afterBuilding);
        setBeforeShapeInfoReset(beforeBuilding);
        setSourceSystemReset(sourceSystems);
        setLightningReset({ lightning });
        setSupplySystemReset(supplySystems);
        setVentilationSystemReset({ ventilation_systems: ventilationSystems });
        setSurfaceConstructionReset({ surface_constructions: surfaceConstructions });
        setFenestrationConstructionReset({ fenestration_constructions: fenestrationConstructions });
        setFenestrationReset({ fenestrations: fenestrations });
        setMaterialReset({ materials: materials });
        setRenewableSystemReset({ photovoltaic_systems: photovoltaicSystems });
        // setDayScReset(daySchedules);
        setFileMetadata({
          filePath: path,
          loadedAt: new Date(),
          name: name,
          type: EFileType.COMPLETED,
        });

        // 분석결과 다시보기 비활성화 처리
        setResult(undefined);

        // 불러온 파일 -> 디버깅 모드 해제
        setIsDebuggingMode(false);

        toast.success("파일을 정상적으로 불러왔습니다.");

        successCallback?.();
      }
    },
    [
      isElectron,
      setBuildingReset,
      setAfterShapeInfoReset,
      setBeforeShapeInfoReset,
      setSourceSystemReset,
      setSupplySystemReset,
      setLightningReset,
      setVentilationSystemReset,
      setSurfaceConstructionReset,
      setFenestrationConstructionReset,
      setFenestrationReset,
      setMaterialReset,
      setRenewableSystemReset,
      setFileMetadata,
      setResult,
      setIsDebuggingMode,
    ],
  );

  const computeLightDensity = (zone: TZoneGuiSchema, lightnings: TLightningGuiSchema[]) => {
    if (!zone) return 0;

    // 기존값이 있으면 그대로 사용
    if (zone.light_density && zone.light_density > 0) {
      return zone.light_density;
    }

    // 1) 바닥면적 합산
    const floorArea =
      zone.surfaces?.filter((s) => s.type === "floor").reduce((sum, s) => sum + (s.area || 0), 0) ||
      0;

    if (floorArea === 0) return 0;

    // 2) 조명 소비전력 계산
    const totalPower =
      zone.lightning?.reduce((sum, zLight) => {
        const master = lightnings.find((m) => m.id === zLight.id);
        if (!master) return sum;

        const power = (master.electric_consumption || 0) * (zLight.count || 0);

        return sum + power;
      }, 0) || 0;

    // 3) 밀도 계산
    return totalPower / floorArea;
  };

  const attachLightDensityToData = (data: TGuiSchema) => {
    const masterLightnings = data.lightning ?? [];

    const attach = (building: TBuildingGeometryGuiSchema) => {
      return {
        ...building,
        buildingFloors:
          building.buildingFloors?.map((floor: TFloorGuiSchema) => ({
            ...floor,
            zones: floor.zones?.map((zone: TZoneGuiSchema) => ({
              ...zone,
              light_density: computeLightDensity(zone, masterLightnings),
            })),
          })) || [],
      };
    };

    return {
      ...data,
      afterBuilding: attach(data.afterBuilding),
      beforeBuilding: attach(data.beforeBuilding),
    };
  };

  const attachedData = useMemo(() => attachLightDensityToData(guiData), [guiData]);

  const saveFile = useCallback(async (): Promise<boolean> => {
    if (!isElectron || !fileMetadata) return false;

    const fileData = await saveJsonFile<TGuiSchema>({
      data: attachedData,
      defaultPath: fileMetadata.filePath ?? null,
      fileName: fileMetadata.name,
    });

    if (fileData.success) {
      setFileMetadata({
        filePath: fileData.path,
        name: fileData.name,
        saveAt: new Date(),
        type: EFileType.COMPLETED,
      });

      // 분석결과 다시보기 비활성화 처리
      setResult(undefined);

      return true;
    }

    return false;
  }, [fileMetadata, attachedData, isElectron, setResult, setFileMetadata]);

  const saveAsFile = useCallback(async (): Promise<boolean> => {
    if (!isElectron || !fileMetadata) return false;

    const fileData = await saveJsonFile<TGuiSchema>({
      data: attachedData,
      defaultPath: null,
      fileName: fileMetadata.name,
    });
    if (fileData.success) {
      setFileMetadata({
        filePath: fileData.path,
        name: fileData.name,
        saveAt: new Date(),
        type: EFileType.COMPLETED,
      });

      return true;
    }

    return false;
  }, [fileMetadata, attachedData, isElectron, setFileMetadata]);

  return { isDirty, loadFile, newFile, saveAsFile, saveFile };
};
