import { Maximize2, Minimize2 } from "lucide-react";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IFloatingWindowProps {
  children: ReactNode;
  className?: string;
  defaultSize?: { height: number; width: number };
  isMinimized?: boolean;
  isOpen: boolean;
  minimizedSize?: { height: number; width: number };
  onToggleMinimize?: () => void;
  title: string;
}

export const FloatingWindow = ({
  children,
  className,
  defaultSize = { height: 600, width: 412 },
  isMinimized = false,
  isOpen,
  minimizedSize = { height: 60, width: 412 },
  onToggleMinimize,
  title,
}: IFloatingWindowProps) => {
  // 화면 중앙을 기본 위치로 설정
  const centerPosition = {
    x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
    y: Math.max(0, (window.innerHeight - defaultSize.height) / 2),
  };

  // 우측 하단 위치 계산 (닫힌 상태)
  const bottomRightPosition = {
    x: Math.max(0, window.innerWidth - minimizedSize.width - 20), // 20px 여백
    y: Math.max(0, window.innerHeight - minimizedSize.height - 20), // 20px 여백
  };

  const [position, setPosition] = useState(centerPosition);
  const [size] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // isMinimized 상태가 변경될 때 위치 자동 조정
  useEffect(() => {
    if (isMinimized) {
      // 최소화될 때 우측 하단으로 이동
      setPosition(bottomRightPosition);
    } else {
      // 최대화될 때 중앙으로 이동
      setPosition(centerPosition);
    }
  }, [
    isMinimized,
    defaultSize.width,
    defaultSize.height,
    minimizedSize.width,
    minimizedSize.height,
  ]);

  // 화면 크기 변경 시 위치 재계산
  useEffect(() => {
    const handleResize = () => {
      const newCenterPosition = {
        x: Math.max(0, (window.innerWidth - defaultSize.width) / 2),
        y: Math.max(0, (window.innerHeight - defaultSize.height) / 2),
      };

      const newBottomRightPosition = {
        x: Math.max(0, window.innerWidth - minimizedSize.width - 20),
        y: Math.max(0, window.innerHeight - minimizedSize.height - 20),
      };

      // 현재 상태에 따라 적절한 위치로 이동
      if (isMinimized) {
        setPosition(newBottomRightPosition);
      } else {
        setPosition(newCenterPosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    defaultSize.width,
    defaultSize.height,
    minimizedSize.width,
    minimizedSize.height,
    isMinimized,
  ]);

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  // 드래그 중
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // 현재 크기에 따른 화면 경계 체크
      const currentWidth = isMinimized ? minimizedSize.width : size.width;
      const currentHeight = isMinimized ? minimizedSize.height : size.height;
      const maxX = window.innerWidth - currentWidth;
      const maxY = window.innerHeight - currentHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragOffset.x,
    dragOffset.y,
    size.width,
    size.height,
    isMinimized,
    minimizedSize.width,
    minimizedSize.height,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        // 드래그 중이 아닐 때만 애니메이션 적용
        !isDragging && "transition-all duration-300 ease-in-out",
        className,
      )}
      ref={windowRef}
      style={{
        height: isMinimized ? minimizedSize.height : size.height,
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: isMinimized ? minimizedSize.width : size.width,
      }}
    >
      {/* 헤더 */}
      <div
        className={cn("flex cursor-move items-center justify-between px-6 py-4 select-none")}
        onMouseDown={handleMouseDown}
        style={{
          height: minimizedSize.height,
        }}
      >
        <span className="truncate text-xl font-semibold">{title}</span>
        <div className="flex items-center gap-1">
          {onToggleMinimize && (
            <Button className="h-6 w-6 p-0" onClick={onToggleMinimize} size="sm" variant="ghost">
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto">
          <div className="h-full overflow-auto">{children}</div>
        </div>
      )}
    </div>
  );
};
