import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 테이블 섹션을 위한 합성 컴포넌트
 * - Header: 섹션 제목과 액션 버튼을 포함하는 헤더
 * - ActionButtons: 편집 모드에서 사용되는 액션 버튼들 (취소, 삭제, 저장)
 */
export const TableSection = Object.assign(
  {},
  {
    ActionButtons: EditActionButtons,
    Header: SectionHeader,
  },
);

/**
 * 테이블 편집 시 사용되는 액션 버튼들
 */
function EditActionButtons({
  onCancel,
  onDelete,
  onSubmit,
}: {
  onCancel: () => void;
  onDelete: () => void;
  onSubmit: () => void;
}) {
  const buttonClassName = "border-neutral160 text-neutral560 py-1";

  return (
    <div className="flex items-center gap-1">
      <Button className={cn(buttonClassName, "p-1")} onClick={onDelete} variant="monoOutline">
        선택 삭제
      </Button>
      <Button className={cn(buttonClassName, "p-1")} onClick={onCancel} variant="monoOutline">
        취소
      </Button>
      <Button className={cn(buttonClassName, "p-1")} onClick={onSubmit} variant="monoOutline">
        저장
      </Button>
    </div>
  );
}

/**
 * 테이블 섹션의 헤더 컴포넌트
 * 제목과 우측 액션 영역을 포함
 */
function SectionHeader({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-10">
      <h4 className="text-lg font-semibold">
        {title} <span className="text-neutral480 text-[16px] font-normal">{description}</span>
      </h4>
      {children}
    </div>
  );
}
