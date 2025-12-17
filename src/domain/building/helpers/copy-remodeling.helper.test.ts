import { describe, expect, it } from "vitest";

import { getCopyShapeInfo, TCopyShapeInfo } from "@/domain/building/helpers/copy-remodeling.helper";
import { ICopyRemodelingTreeState } from "@/domain/building/hooks/useCopyRemodelingTree";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { MOCK_SHAPE_INFO } from "@/test/mock";

describe("getCopyShapeInfo", () => {
  // 테스트용 TreeViewState 생성 헬퍼 함수
  const createTreeViewState = (
    floors: string[] = [],
    zones: string[] = [],
    surfaces: string[] = [],
    photovoltaicSystems: string[] = [],
  ): ICopyRemodelingTreeState => ({
    floors: new Set(floors),
    photovoltaicSystems: new Set(photovoltaicSystems),
    surfaces: new Set(surfaces),
    zones: new Set(zones),
  });

  // isCopied 플래그 확인 헬퍼 함수
  const checkIsCopiedFlags = (shapeInfo: TCopyShapeInfo) => {
    const result = {
      floors: [] as string[],
      surfaces: [] as string[],
      zones: [] as string[],
    };

    shapeInfo.forEach((floor) => {
      if (floor.isCopied) {
        result.floors.push(floor.floor_id);
      }
      floor.zones.forEach((zone) => {
        if (zone.isCopied) {
          result.zones.push(zone.id);
        }
        zone.surfaces.forEach((surface) => {
          if (surface.isCopied) {
            result.surfaces.push(surface.id);
          }
        });
      });
    });

    return result;
  };

  describe("기본 동작 테스트", () => {
    it("빈 addShapeSets가 주어지면 targetShapeInfo를 그대로 반환하고 모든 isCopied는 false여야 함", () => {
      const addShapeSets = createTreeViewState();
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo = MOCK_SHAPE_INFO;

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      // 결과가 targetShapeInfo와 동일한 구조를 가져야 함
      expect(result.shapeInfo).toHaveLength(targetShapeInfo.length);

      // 모든 isCopied가 false여야 함
      const copiedFlags = checkIsCopiedFlags(result.shapeInfo);
      expect(copiedFlags.floors).toHaveLength(0);
      expect(copiedFlags.zones).toHaveLength(0);
      expect(copiedFlags.surfaces).toHaveLength(0);
    });

    it("전체 floor를 복사할 때 정상적으로 isCopied 플래그가 설정되어야 함", () => {
      const addShapeSets = createTreeViewState([MOCK_SHAPE_INFO[0].floor_id]);
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo: TFloorGuiSchema[] = [];

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      expect(result.shapeInfo).toHaveLength(1);
      expect(result.shapeInfo[0].floor_id).toBe(MOCK_SHAPE_INFO[0].floor_id);
      expect(result.shapeInfo[0].isCopied).toBe(true);

      // 모든 하위 요소들도 isCopied가 true여야 함
      result.shapeInfo[0].zones.forEach((zone) => {
        expect(zone.isCopied).toBe(true);
        zone.surfaces.forEach((surface) => {
          expect(surface.isCopied).toBe(true);
        });
      });
    });

    it("특정 zone만 복사할 때 해당 zone과 surface만 isCopied가 true여야 함", () => {
      const addShapeSets = createTreeViewState(
        [MOCK_SHAPE_INFO[0].floor_id],
        [MOCK_SHAPE_INFO[0].zones[0].id],
      );
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo: TFloorGuiSchema[] = [];

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      expect(result.shapeInfo).toHaveLength(1);
      expect(result.shapeInfo[0].floor_id).toBe(MOCK_SHAPE_INFO[0].floor_id);
      expect(result.shapeInfo[0].isCopied).toBe(true);

      // floor1_zone1만 isCopied가 true여야 함
      const zone1 = result.shapeInfo[0].zones.find((z) => z.id === MOCK_SHAPE_INFO[0].zones[0].id);
      expect(zone1?.isCopied).toBe(true);

      // 다른 zone은 없어야 함 (floor1에는 zone1만 있음)
      expect(result.shapeInfo[0].zones).toHaveLength(1);
    });

    it("특정 surface만 복사할 때 해당 surface만 isCopied가 true여야 함", () => {
      const addShapeSets = createTreeViewState(
        [MOCK_SHAPE_INFO[0].floor_id],
        [MOCK_SHAPE_INFO[0].zones[0].id],
        [MOCK_SHAPE_INFO[0].zones[0].surfaces[0].id],
      );
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo: TFloorGuiSchema[] = [];

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      expect(result.shapeInfo).toHaveLength(1);
      expect(result.shapeInfo[0].floor_id).toBe(MOCK_SHAPE_INFO[0].floor_id);
      expect(result.shapeInfo[0].isCopied).toBe(true);

      const zone1 = result.shapeInfo[0].zones.find((z) => z.id === MOCK_SHAPE_INFO[0].zones[0].id);
      expect(zone1?.isCopied).toBe(true);

      // floor1_zone1_wall1만 isCopied가 true여야 함
      const wall1 = zone1?.surfaces.find(
        (s) => s.id === MOCK_SHAPE_INFO[0].zones[0].surfaces[0].id,
      );
      expect(wall1?.isCopied).toBe(true);

      // 다른 surface는 없어야 함
      expect(zone1?.surfaces).toHaveLength(1);
    });
  });

  describe("병합 로직 테스트", () => {
    it("기존 targetShapeInfo와 새로운 addShapeInfo를 병합할 때 정상적으로 처리되어야 함", () => {
      const addShapeSets = createTreeViewState([MOCK_SHAPE_INFO[0].floor_id]);
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo = [MOCK_SHAPE_INFO[1]]; // floor2만 있는 상태

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      // floor1과 floor2가 모두 있어야 함
      expect(result.shapeInfo).toHaveLength(2);
    });

    it("같은 floor_number를 가진 floor를 병합할 때 정상적으로 처리되어야 함", () => {
      const addShapeSets = createTreeViewState(
        [MOCK_SHAPE_INFO[0].floor_id],
        [MOCK_SHAPE_INFO[0].zones[0].id],
      );
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo = [MOCK_SHAPE_INFO[0]]; // floor1만 있는 상태

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      expect(result.shapeInfo).toHaveLength(1);
      expect(result.shapeInfo[0].floor_id).toBe(MOCK_SHAPE_INFO[0].floor_id);
    });
  });

  describe("정렬 테스트", () => {
    it("결과가 floor_number 기준으로 정렬되어야 함", () => {
      const addShapeSets = createTreeViewState(["floor2", "floor1"]);
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo: TFloorGuiSchema[] = [];

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      expect(result.shapeInfo).toHaveLength(2);
      expect(result.shapeInfo[0].floor_number).toBe(2);
      expect(result.shapeInfo[1].floor_number).toBe(1);
    });
  });

  describe("데이터 무결성 테스트", () => {
    it("원본 데이터가 변경되지 않아야 함", () => {
      const addShapeSets = createTreeViewState(["floor1"]);
      const baseShapeInfo = JSON.parse(JSON.stringify(MOCK_SHAPE_INFO));
      const targetShapeInfo = JSON.parse(JSON.stringify(MOCK_SHAPE_INFO));

      getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      // 원본 데이터가 변경되지 않았는지 확인
      expect(baseShapeInfo).toEqual(JSON.parse(JSON.stringify(MOCK_SHAPE_INFO)));
      expect(targetShapeInfo).toEqual(JSON.parse(JSON.stringify(MOCK_SHAPE_INFO)));
    });

    it("반환된 객체가 새로운 객체여야 함 (참조가 달라야 함)", () => {
      const addShapeSets = createTreeViewState(["floor1"]);
      const baseShapeInfo = MOCK_SHAPE_INFO;
      const targetShapeInfo = MOCK_SHAPE_INFO;

      const result = getCopyShapeInfo({
        addDataIds: addShapeSets,
        originRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: baseShapeInfo,
        },
        targetRemodelingData: {
          photovoltaicSystems: [],
          shapeInfo: targetShapeInfo,
        },
      });

      // 참조가 달라야 함
      expect(result.shapeInfo).not.toBe(targetShapeInfo);
      expect(result.shapeInfo[0]).not.toBe(targetShapeInfo[0]);
      expect(result.shapeInfo[0].zones[0]).not.toBe(targetShapeInfo[0].zones[0]);
    });
  });
});
