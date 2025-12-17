import { cn } from "@/lib/utils";

export interface IRadioProps {
  checked?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

/**
 * 커스텀 라디오 컴포넌트: 네이티브 input을 숨기고 스타일링된 원형 버튼을 표시
 */
const Radio = ({ checked = false, disabled = false, id, name, onChange, value }: IRadioProps) => {
  return (
    <div className="relative flex">
      <input
        checked={checked}
        className={cn("peer sr-only", disabled && "cursor-not-allowed opacity-50")}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        type={"radio"}
        value={value}
      />

      {/* round */}
      <div
        className={cn(
          "border-neutral240 peer-checked:border-primary relative flex h-4 w-4 flex-shrink-0 justify-center rounded-full border-1",
          disabled && "bg-neutral080",
        )}
      />

      {/* inner */}
      <div
        className={cn(
          "bg-primary absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity peer-checked:opacity-100",
        )}
      />
    </div>
  );
};

export default Radio;
