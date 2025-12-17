import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 수량 조정 스테퍼 UI 컴포넌트
 *
 * 주요 기능:
 * - +/- 버튼으로 숫자 값을 증가/감소시킬 수 있음
 * - 직접 input에 숫자를 입력하여 값 변경 가능
 * - 최솟값(min) 설정으로 하한선 제한
 * - 최솟값 이하로 내려갈 수 없을 때 감소 버튼 비활성화
 */
interface IProps {
  min?: number; // 최솟값 (기본값: 0)
  onValueChange: (value: number) => void; // 값 변경 시 실행될 콜백 함수
  value: number; // 현재 값
}

// TODO: input 지우고 number를 집어넣을 수 있게 만들어야함.
// 현재는 min 값만 제어
export const StepperUI = ({ min = 0, onValueChange, value }: IProps) => {
  const handleDecreaseValue = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncreaseValue = () => {
    onValueChange(value + 1);
  };

  // 감소 버튼 비활성화 여부 (최솟값 이하일 때)
  const disabledMinus = value <= min;

  const BUTTON_CLASSNAME =
    "bg-neutral080 flex h-full w-[30px] cursor-pointer items-center justify-center transition-opacity disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="flex h-[30px] border">
      {/* 감소 버튼 */}
      <button
        className={cn(BUTTON_CLASSNAME, "border-r")}
        disabled={disabledMinus}
        onClick={handleDecreaseValue}
      >
        <Minus className="text-neutral640" size={10} strokeWidth={3} />
      </button>

      {/* 숫자 입력 필드 */}
      <input
        className="w-10 px-2.5 text-center"
        onChange={(e) => {
          const inputValue = Number(e.target.value);
          // 최솟값보다 작으면 최솟값으로 설정, 그렇지 않으면 입력값 사용
          if (inputValue < min) {
            onValueChange(min);
          } else {
            onValueChange(inputValue);
          }
        }}
        value={value}
      />

      {/* 증가 버튼 */}
      <button className={cn(BUTTON_CLASSNAME, "border-l")} onClick={handleIncreaseValue}>
        <Plus className="text-neutral640" size={10} strokeWidth={3} />
      </button>
    </div>
  );
};
