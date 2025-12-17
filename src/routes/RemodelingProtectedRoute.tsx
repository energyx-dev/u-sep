import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { ERemodelingType } from "@/enums/ERemodelingType";
import { useRemodelingTypeStore } from "@/store/remodeling-type.store";

export const RemodelingProtectedRoute = () => {
  const { pathname } = useLocation();

  // 전역 상태: 리모델링 타입
  const { remodelingType, setRemodelingType } = useRemodelingTypeStore(
    useShallow((state) => ({
      remodelingType: state.remodelingType,
      setRemodelingType: state.setRemodelingType,
    })),
  );

  // pathname: 리모델링 타입
  const remodelingTypeFromPath = useMemo(
    () =>
      pathname.includes(ERemodelingType.AFTER) ? ERemodelingType.AFTER : ERemodelingType.BEFORE,
    [pathname],
  );

  // 전역 상태 동기화
  useEffect(() => {
    if (remodelingType !== remodelingTypeFromPath) {
      setRemodelingType(remodelingTypeFromPath);
    }
  }, [remodelingTypeFromPath, remodelingType, setRemodelingType]);

  return <Outlet />;
};
