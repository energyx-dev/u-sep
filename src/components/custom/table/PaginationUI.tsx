import { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IProps {
  maxButtonCount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
}

// 현재 페이지가 가운데에 오도록 인덱스 배열 반환
const getPaginationRange = ({
  currentPage,
  maxButtonCount = 5,
  totalPage,
}: {
  currentPage: number;
  maxButtonCount?: number;
  totalPage: number;
}) => {
  const half = Math.floor(maxButtonCount / 2);
  let start = Math.max(0, currentPage - half);
  let end = start + maxButtonCount - 1;

  // 끝 인덱스가 전체 페이지를 넘으면 조정
  if (end >= totalPage - 1) {
    end = totalPage - 1;
    start = Math.max(0, end - maxButtonCount + 1);
  }

  // 실제로 보여줄 페이지 인덱스 배열 반환
  return Array.from({ length: Math.min(totalPage, maxButtonCount) }, (_, i) => start + i);
};

// 페이지네이션 UI
export const PaginationUI = ({ maxButtonCount = 5, table }: IProps) => {
  const currentPage = table.getState().pagination.pageIndex;
  const totalPage = table.getPageCount();
  const pageArray = getPaginationRange({ currentPage, maxButtonCount, totalPage });

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
        size={"sm"}
        variant="ghost"
      >
        <ChevronLeftIcon />
      </Button>
      {pageArray.map((page) => (
        <Button
          className={cn("text-bk4", page === currentPage && "text-primary")}
          key={page}
          onClick={() => table.setPageIndex(page)}
          size="sm"
          variant={"ghost"}
        >
          {page + 1}
        </Button>
      ))}
      <Button
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
        size={"sm"}
        variant="ghost"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
};
