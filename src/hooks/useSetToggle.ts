import { useCallback, useState } from "react";

// Set 자료구조로 선택/토글 상태를 관리하는 커스텀 훅
export const useSetToggle = <T>(initialSet: Set<T>) => {
  // 현재 선택된 값들의 Set 상태
  const [selected, setSelected] = useState<Set<T>>(initialSet);

  // 특정 값을 Set에 추가/제거(토글)하는 함수
  const toggle = useCallback((item: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  return { selected, setSelected, toggle };
};
