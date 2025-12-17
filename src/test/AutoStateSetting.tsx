import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ERemodelingType } from "@/enums/ERemodelingType";
import { useDataSyncActions } from "@/hooks/useDataSyncActions";
import {
  MOCK_BUILDING_INFO,
  // MOCK_DAY_SCHEDULE,
  MOCK_FENESTRATION,
  MOCK_FENESTRATION_CONSTRUCTION,
  MOCK_MATERIALS,
  MOCK_SHAPE_INFO,
  MOCK_SOURCE_SYSTEM,
  MOCK_SUPPLY_SYSTEM,
  MOCK_SURFACE_CONSTRUCTION,
  MOCK_VENTILATION_SYSTEM,
} from "@/test/mock";

// 개발 편의를 위해, 건물 개요, 형상정보, 설비 데이터 전역에 목데이터 삽입 버튼
export const AutoStateSettingButton = () => {
  const {
    // setDaySc,
    setFenestration,
    setFenestrationConstruction,
    setMaterial,
    setSourceSystem,
    setSupplySystem,
    setSurfaceConstruction,
    setVentilationSystem,
  } = useDataSyncActions();

  const {
    setBuildingInfo: setBeforeBuildingInfo,
    // setPhotovoltaicSystem: setBeforePhotovoltaicSystem,
    setShapeInfo: setBeforeShapeInfo,
  } = useDataSyncActions(ERemodelingType.BEFORE);
  const {
    setBuildingInfo: setAfterBuildingInfo,
    // setPhotovoltaicSystem: setAfterPhotovoltaicSystem,
    setShapeInfo: setAfterShapeInfo,
  } = useDataSyncActions(ERemodelingType.AFTER);

  const handleClick = () => {
    // 건물 정보 설정
    setBeforeBuildingInfo(MOCK_BUILDING_INFO);
    setAfterBuildingInfo(MOCK_BUILDING_INFO);

    // 층/존 정보 설정
    setBeforeShapeInfo(MOCK_SHAPE_INFO);
    setAfterShapeInfo(MOCK_SHAPE_INFO);

    // 태양광 시스템 데이터 설정
    // setBeforePhotovoltaicSystem({ photovoltaic_systems: MOCK_PHOTOVOLTAIC_SYSTEM });
    // setAfterPhotovoltaicSystem({ photovoltaic_systems: MOCK_PHOTOVOLTAIC_SYSTEM });

    // 공급 설비 데이터 설정
    setSupplySystem(MOCK_SUPPLY_SYSTEM);

    // 생산 설비 데이터 설정
    setSourceSystem(MOCK_SOURCE_SYSTEM);

    // 환기 설비 데이터 설정
    setVentilationSystem(MOCK_VENTILATION_SYSTEM);

    // 면 구조체
    setSurfaceConstruction(MOCK_SURFACE_CONSTRUCTION);

    // 개구부 구조체
    setFenestrationConstruction(MOCK_FENESTRATION_CONSTRUCTION);

    // 개구부
    setFenestration(MOCK_FENESTRATION);

    // 재료 데이터 설정
    setMaterial(MOCK_MATERIALS);

    // 일간 스케줄 데이터 설정
    // setDaySc(MOCK_DAY_SCHEDULE);

    toast.success("Mock 데이터가 전역 상태에 설정되었습니다.");
  };

  return (
    <Button onClick={handleClick} variant="secondary">
      Auto State Setting
    </Button>
  );
};
