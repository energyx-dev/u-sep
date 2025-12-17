import { customNanoid } from "@/lib/utils";
import { TTemplateReference } from "@/types/template.types";

/**
 * 템플릿 리스트(templateList)와 마스터 리스트(masterList)를 받아,
 * templateList의 count만큼 masterList에서 id가 일치하는 객체를 복제하여 새로운 id를 부여해 반환하는 함수
 *
 * @param masterList - id 프로퍼티를 가진 객체 배열 (제너릭)
 * @param templateList - { id, count } 형태의 템플릿 참조 리스트
 * @param isNewId - 새로운 id를 부여할지 여부
 * @returns 변환된 객체 인스턴스 리스트
 */
export const convertTemplateToInstances = <T extends { id: string }>({
  isNewId = true,
  masterList,
  templateList,
}: {
  isNewId?: boolean;
  masterList: T[];
  templateList: TTemplateReference[];
}): T[] => {
  // 변환된 인스턴스 리스트를 누적
  const instanceList = templateList.reduce<T[]>((acc, { count, id }) => {
    // id로 해당 객체 찾기
    const templateItem = masterList.find((obj) => obj.id === id);

    if (templateItem) {
      // count만큼 복제하여 id를 새로 생성
      for (let i = 0; i < count; i++) {
        acc.push({
          ...templateItem,
          id: isNewId ? customNanoid(16) : templateItem.id, // 새로운 id 부여
        });
      }
    }

    return acc;
  }, []);

  return instanceList;
};

/**
 * 인스턴스 리스트(instanceList)를 받아,
 * 각 id별로 등장 횟수를 세어 { id, count } 형태의 템플릿 참조 리스트로 변환하는 함수
 *
 * @param instanceList - id 프로퍼티를 가진 객체 배열 (제너릭)
 * @returns { id, count } 형태의 템플릿 참조 리스트
 */
export const convertInstancesToTemplate = <T extends { id: string }>({
  instanceList,
}: {
  instanceList: T[];
}): TTemplateReference[] => {
  // 각 id별로 등장 횟수를 누적할 객체 생성
  const templateList = instanceList.reduce<{ [key: string]: number }>((acc, curr) => {
    acc[curr.id] = (acc[curr.id] || 0) + 1; // 이미 있으면 +1, 없으면 1로 초기화
    return acc;
  }, {});

  // 누적된 결과를 { id, count } 형태의 배열로 변환하여 반환
  return Object.entries(templateList).map(([id, count]) => ({
    count,
    id,
  }));
};

/**
 * 템플릿 리스트와 마스터 데이터를 받아,
 * 각 템플릿 항목의 id에 해당하는 마스터 데이터 객체에 count 속성을 추가하여 반환하는 타입
 *
 * 예시:
 *   마스터 데이터: [{ id: "a", name: "A" }, { id: "b", name: "B" }]
 *   템플릿 리스트: [{ id: "a", count: 2 }, { id: "b", count: 1 }]
 *   결과: [{ id: "a", name: "A", count: 2 }, { id: "b", name: "B", count: 1 }]
 */
export type TTemplateToInstanceMergeIds<T extends { id: string }> = T & { count: number };

/**
 * 템플릿 리스트와 마스터 리스트를 받아,
 * 각 템플릿 항목의 id에 해당하는 마스터 데이터에 count를 병합하여 반환하는 함수
 *
 * @param masterList - id 속성을 가진 마스터 데이터 배열
 * @param templateList - { id, count } 형태의 템플릿 참조 배열
 * @returns count가 병합된 마스터 데이터 배열
 */
export const convertTemplateToInstanceMergeIds = <T extends { id: string }>({
  masterList,
  templateList,
}: {
  masterList: T[];
  templateList: TTemplateReference[];
}): TTemplateToInstanceMergeIds<T>[] => {
  // 결과를 누적할 배열을 reduce로 생성
  return templateList.reduce<TTemplateToInstanceMergeIds<T>[]>((acc, curr) => {
    // 템플릿의 id와 일치하는 마스터 데이터 찾기
    const master = masterList.find((master) => master.id === curr.id);

    if (master) {
      // 마스터 데이터에 count 속성을 추가하여 결과에 push
      acc.push({
        ...master,
        count: curr.count,
      });
    }
    // 일치하는 마스터 데이터가 없으면 아무것도 추가하지 않음

    return acc;
  }, []);
};
