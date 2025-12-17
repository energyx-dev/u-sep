import { useShallow } from "zustand/shallow";

import { ERemodelingType } from "@/enums/ERemodelingType";
import {
  useAfterBuildingGeometryStore,
  useBeforeBuildingGeometryStore,
} from "@/store/building-geometry.store";
import { useRemodelingTypeStore } from "@/store/remodeling-type.store";

/**
 * 리모델링 타입에 따라 적절한 형상 정보 스토어를 반환하는 훅
 * @param explicitRemodelingType - 명시적으로 지정할 리모델링 타입 (선택적)
 * @returns 해당하는 형상 정보 스토어
 */
export const useBuildingGeometryStore = (explicitRemodelingType?: ERemodelingType) => {
  const { remodelingType } = useRemodelingTypeStore(
    useShallow((state) => ({
      remodelingType: state.remodelingType,
    })),
  );

  const beforeStore = useBeforeBuildingGeometryStore(
    useShallow((state) => ({
      ...state,
    })),
  );

  const afterStore = useAfterBuildingGeometryStore(
    useShallow((state) => ({
      ...state,
    })),
  );

  // 명시적으로 지정된 타입이 있으면 해당 타입 사용, 없으면 현재 전역상태 타입 사용
  const targetRemodelingType = explicitRemodelingType ?? remodelingType;

  return targetRemodelingType === ERemodelingType.BEFORE ? beforeStore : afterStore;
};
