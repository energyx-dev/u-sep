import { useOverlay } from "@toss/use-overlay";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { STEP_PATH } from "@/constants/routes";
import { SurfaceConstructionManageDialog } from "@/domain/shape-info/components/surface/SurfaceConstructionManageDialog";
import { useSurfaceEditor } from "@/domain/shape-info/hooks/useSurfaceEditor";
import {
  BUILDING_SURFACE_TYPE,
  CONSTRUCTION_ID_LABELS,
} from "@/domain/shape-info/schemas/surface/surface.enum";
import { TSurfaceConstructionEngineAndGuiSchema } from "@/domain/surface-constructions/schemas/surface-constructions.schema";
import { useSurfaceConstructionStore } from "@/domain/surface-constructions/stores/surface-constructions.store";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

/**
 * 면 구조체 관리를 위한 커스텀 훅
 *
 * - 면 구조체 선택 다이얼로그 제어
 * - 면 구조체 적용 및 페이지 이동 기능 제공
 *
 */
export const useSurfaceConstructionManage = ({
  surfaceId,
  zoneId,
}: {
  surfaceId: string;
  zoneId: string;
}) => {
  const overlay = useOverlay();
  const navigate = useNavigate();
  const { getSurfaceById, updateSurface } = useSurfaceEditor();

  const surfaceData = getSurfaceById({ surfaceId, zoneId });

  const { surface_constructions } = useSurfaceConstructionStore(
    useShallow((state) => ({
      surface_constructions: state.surface_constructions,
    })),
  );

  // 확인 다이얼로그 훅
  const { openConfirmDialog } = useConfirmDialog();

  const masterSurfaceConstructions = surface_constructions.filter(
    (c) =>
      c.type ===
      (surfaceData?.type === BUILDING_SURFACE_TYPE.ceiling
        ? BUILDING_SURFACE_TYPE.floor
        : surfaceData?.type),
  );

  const augmentedMasterSurfaceConstructions = useMemo(
    () => [
      ...Object.entries(CONSTRUCTION_ID_LABELS).map(
        ([id, name]) =>
          ({
            id,
            isLabel: true,
            items: [],
            layers: [],
            name,
            type:
              surfaceData?.type === BUILDING_SURFACE_TYPE.ceiling
                ? BUILDING_SURFACE_TYPE.floor
                : (surfaceData?.type ?? BUILDING_SURFACE_TYPE.wall),
          }) as TSurfaceConstructionEngineAndGuiSchema,
      ),
      ...masterSurfaceConstructions,
    ],
    [masterSurfaceConstructions, surfaceData?.type],
  );

  const viewData = useMemo(() => {
    const constructionId = surfaceData?.construction_id;

    let surfaceConstructionTemplates: TSurfaceConstructionEngineAndGuiSchema[] = [];

    if (constructionId) {
      const isLabelId = constructionId in CONSTRUCTION_ID_LABELS;

      if (isLabelId) {
        const name = CONSTRUCTION_ID_LABELS[constructionId as keyof typeof CONSTRUCTION_ID_LABELS];

        const type =
          surfaceData?.type === BUILDING_SURFACE_TYPE.ceiling
            ? BUILDING_SURFACE_TYPE.floor
            : (surfaceData?.type ?? BUILDING_SURFACE_TYPE.wall);

        surfaceConstructionTemplates = [
          {
            id: constructionId,
            isLabel: true,
            items: [],
            layers: [],
            name,
            type,
          } as TSurfaceConstructionEngineAndGuiSchema,
        ];
      } else {
        surfaceConstructionTemplates = masterSurfaceConstructions
          .filter((c) => c.id === constructionId)
          .map((c) => {
            const shouldReverse = !!surfaceData?.adjacent_from;

            const layers = shouldReverse ? [...c.layers].reverse() : c.layers;

            return {
              ...c,
              layers,
            };
          });
      }
    }

    return surfaceConstructionTemplates;
  }, [
    augmentedMasterSurfaceConstructions,
    masterSurfaceConstructions,
    surfaceData?.construction_id,
    surfaceData?.type,
  ]);

  const handleGoToSurfaceConstructionPage = useCallback(() => {
    navigate(STEP_PATH.SURFACE_CONSTRUCTIONS.path);
  }, [navigate]);

  const handleOpenSurfaceConstructionSelectDialog = useCallback(async () => {
    // 등록된 면 구조체가 있으면 선택 다이얼로그 열기
    overlay.open(({ close, isOpen }) => (
      <SurfaceConstructionManageDialog
        columnId={"construction_id"}
        data={augmentedMasterSurfaceConstructions}
        dialogTitle="면 구조체"
        isOpen={isOpen}
        onClose={close}
        onGoToPage={handleGoToSurfaceConstructionPage}
        onSelect={({ surfaceConstructionId }) => {
          updateSurface({
            adjacentSurfaceId: surfaceData?.adjacent_surface_id,
            data: {
              construction_id: surfaceConstructionId,
            },
            surfaceId,
          });
        }}
        rowIndex={0}
        savedList={[] as TSurfaceConstructionEngineAndGuiSchema[]}
        selectedId={viewData[0]?.id || ""}
        type={surfaceData?.type ?? BUILDING_SURFACE_TYPE.wall}
      />
    ));
  }, [
    masterSurfaceConstructions,
    navigate,
    openConfirmDialog,
    overlay,
    surfaceData?.type,
    surfaceId,
    updateSurface,
  ]);

  return { handleOpenSurfaceConstructionSelectDialog, viewData };
};
