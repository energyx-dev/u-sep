export interface IBaseTreeItem<T> {
  children?: T[];
  id: string;
}

export const getExpandedIdsByTargetId = <T extends IBaseTreeItem<T>>({
  items,
  targetId,
}: {
  items: T | T[];
  targetId?: string;
}): string[] => {
  const list = Array.isArray(items) ? items : [items];

  return list.reduce<string[]>((acc, node) => {
    // 1) 현재 노드가 타겟이면, 여기까지만 열기
    if (node.id === targetId) {
      return [...acc, node.id];
    }

    // 2) 자식 노드들에서 재귀 탐색
    if (node.children) {
      const path = getExpandedIdsByTargetId({ items: node.children, targetId });
      if (path.length > 0) {
        return [...acc, node.id, ...path];
      }
    }

    // 3) target 못 찾으면 acc 그대로
    return acc;
  }, []);
};
