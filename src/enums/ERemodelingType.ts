export enum ERemodelingType {
  AFTER = "after",
  BEFORE = "before",
}

export const REMODELING_TYPE_LABEL = {
  [ERemodelingType.AFTER]: "리모델링 후",
  [ERemodelingType.BEFORE]: "리모델링 전",
};

export const REMODELING_TYPE_OPTIONS = [
  {
    label: REMODELING_TYPE_LABEL[ERemodelingType.BEFORE],
    value: ERemodelingType.BEFORE,
  },
  {
    label: REMODELING_TYPE_LABEL[ERemodelingType.AFTER],
    value: ERemodelingType.AFTER,
  },
];
