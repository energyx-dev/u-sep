import { createColumnHelper } from "@tanstack/react-table";

type TData = {
  description: string;
  id: string;
  isActive: boolean;
  name: string;
  type: string;
  value: string;
};

// 초기 예제 데이터
export const initialData: TData[] = [
  {
    description: "시스템 기본 이름",
    id: "1",
    isActive: true,
    name: "시스템 이름",
    type: "문자열",
    value: "EnergyX",
  },
  {
    description: "기본 시간대 설정",
    id: "2",
    isActive: true,
    name: "기본 시간대",
    type: "문자열",
    value: "Asia/Seoul",
  },
  {
    description: "백업 주기(시간)",
    id: "3",
    isActive: true,
    name: "백업 주기",
    type: "숫자",
    value: "24",
  },
  {
    description: "용량 경고 임계값(%)",
    id: "4",
    isActive: true,
    name: "경고 임계값",
    type: "숫자",
    value: "85",
  },
  {
    description: "로그 파일 보관 기간(일)",
    id: "5",
    isActive: true,
    name: "로그 보관일",
    type: "숫자",
    value: "90",
  },
  {
    description: "자동 로그아웃 시간(분)",
    id: "6",
    isActive: false,
    name: "자동 로그아웃",
    type: "숫자",
    value: "30",
  },
  {
    description: "알림 수신 이메일",
    id: "7",
    isActive: true,
    name: "관리자 이메일",
    type: "문자열",
    value: "admin@energyx.com",
  },
  {
    description: "유지보수 모드 활성화",
    id: "8",
    isActive: false,
    name: "유지보수 모드",
    type: "불리언",
    value: "false",
  },
  {
    description: "시스템 알림 활성화",
    id: "9",
    isActive: true,
    name: "알림 활성화",
    type: "불리언",
    value: "true",
  },
  {
    description: "동시 접속 사용자 제한",
    id: "10",
    isActive: true,
    name: "최대 사용자 수",
    type: "숫자",
    value: "100",
  },
];

const getColumns = () => {
  const columnHelper = createColumnHelper<TData>();
  return [
    columnHelper.accessor("id", {
      cell: (info) => info.getValue(),
      header: "ID",
      size: 20,
    }),
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "설정 이름",
      size: 200,
    }),
    columnHelper.accessor("value", {
      cell: (info) => info.getValue(),
      header: "값",
      size: 200,
    }),
    columnHelper.accessor("type", {
      cell: (info) => info.getValue(),
      header: "타입",
      size: 200,
    }),
    columnHelper.accessor("description", {
      cell: (info) => info.getValue(),
      header: "설명",
      size: 200,
    }),
    columnHelper.accessor("isActive", {
      cell: (info) => (info.getValue() ? "예" : "아니오"),
      header: "활성화",
      size: 200,
    }),
  ];
};

export const mockExcelTableData = {
  columns: getColumns(),
  data: initialData,
};
