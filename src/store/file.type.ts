export enum EFileType {
  COMPLETED = "COMPLETED", // 새파일 or 불러오기 or 저장 직후 : 다시 저장할 필요가 없는 상태
  IN_PROGRESS = "IN_PROGRESS", // 수정 중인 파일 : 저장할 필요가 있는 상태
}
