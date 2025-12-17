import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/**
 * 테이블 폼 레이아웃 컴포넌트
 *
 * 테이블과 관련된 UI 요소들을 일관된 레이아웃으로 구성하는 컴포넌트
 * Header와 Wrapper 서브 컴포넌트를 포함하며, Object.assign을 통해 네임스페이스화
 *
 * 사용 예시:
 * <TableForm.Wrapper>
 *   <TableForm.Header title="사용자 목록" onClickManage={handleManage} />
 *   <Table />
 * </TableForm.Wrapper>
 */
export const TableForm = Object.assign(
  {},
  {
    Header,
    Wrapper,
  },
);

/**
 * 테이블 폼 헤더 컴포넌트
 * 제목, 관리 버튼, 선택 타입 표시를 포함하는 헤더 영역
 *
 * @param onClickManage - 관리 버튼 클릭 시 실행될 함수
 * @param title - 헤더에 표시될 제목
 */
function Header({
  isPrimarySurface,
  isRequired = false,
  onClickManage,
  title,
}: {
  isPrimarySurface?: boolean;
  isRequired?: boolean;
  onClickManage: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-neutral640 flex items-center gap-0.5 text-base font-semibold">
        {title}
        {isRequired && <span className="text-destructive">*</span>}
      </span>
      <Button
        className="border-neutral160 text-neutral560 hover:bg-neutral040 h-6 px-1.5"
        onClick={onClickManage}
        variant={"outline"}
      >
        관리
      </Button>
      {isPrimarySurface !== undefined && !isPrimarySurface && (
        <span className="text-neutral560 ml-auto text-sm">
          기준면과 방향이 반대이므로, 구조체의 재료를 상대면에 역순으로 배치합니다.
        </span>
      )}
    </div>
  );
}

/**
 * 테이블 폼 래퍼 컴포넌트
 * 자식 요소들을 세로로 배치하는 컨테이너 역할
 *
 * @param children - 래퍼 내부에 포함될 React 노드들
 */
function Wrapper({ children }: { children?: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}
