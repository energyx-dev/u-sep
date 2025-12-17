import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface IProps {
  max?: number; // 최댓값 (기본값: Infinity)
  min?: number; // 최솟값 (기본값: 0)
  onValueChange: (value: number) => void; // 값 변경 시 실행될 콜백 함수
  value: number; // 현재 값
}

/**
 * 수량 조정 스테퍼 UI 컴포넌트
 *
 * 주요 기능:
 * - +/- 버튼으로 숫자 값을 증가/감소시킬 수 있음
 * - 직접 input에 숫자를 입력하여 값 변경 가능
 * - 최솟값(min) 설정으로 하한선 제한
 * - 최솟값 이하로 내려갈 수 없을 때 감소 버튼 비활성화
 * - 숫자 외 입력 방지 및 0 이상의 양수만 허용
 *
 * @param max - (optional) 최댓값. 지정하지 않으면 무제한(Infinity)으로 설정됩니다.
 * @param min - (optional) 최솟값. 기본값은 0입니다.
 * @param onValueChange - (required) 값 변경 시 실행될 콜백 함수.
 * @param value - (required) 현재 값.
 */
export const NewStepperUI = ({ max = Infinity, min = 0, onValueChange, value }: IProps) => {
  const handleDecreaseValue = () => {
    if (value > min) {
      onValueChange(value - 1);
    }
  };

  const handleIncreaseValue = () => {
    if (value < max) {
      onValueChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 숫자 외 입력 방지
    if (!/^\d*$/.test(inputValue)) return;

    const parsedValue = Number(inputValue);

    // min 이상, max 이하일 때만 반영
    if (!isNaN(parsedValue)) {
      if (parsedValue >= min && parsedValue <= max) {
        onValueChange(parsedValue);
      } else if (parsedValue < min) {
        onValueChange(min);
      } else if (parsedValue > max) {
        onValueChange(max);
      }
    }
  };

  const BUTTON_CLASSNAME =
    "bg-neutral080 flex h-full w-[30px] cursor-pointer items-center justify-center transition-opacity disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="flex h-[30px] border">
      {/* 감소 버튼 */}
      <button
        className={cn(BUTTON_CLASSNAME, "border-r")}
        disabled={value <= min}
        onClick={handleDecreaseValue}
      >
        <Minus className="text-neutral640" size={10} strokeWidth={3} />
      </button>

      {/* 숫자 입력 필드 */}
      <input
        className="w-10 appearance-none text-center outline-none"
        max={max}
        min={min}
        onChange={handleInputChange}
        type="number"
        value={value}
      />

      {/* 증가 버튼 */}
      <button
        className={cn(BUTTON_CLASSNAME, "border-l")}
        disabled={value >= max}
        onClick={handleIncreaseValue}
      >
        <Plus className="text-neutral640" size={10} strokeWidth={3} />
      </button>
    </div>
  );
};
