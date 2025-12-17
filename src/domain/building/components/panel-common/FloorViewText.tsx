import { formatFloorNumber } from "@/domain/shape-info/utils/shape-info.utils";

interface IProps {
  name: string;
  num: number;
}

export const FloorViewText = ({ name, num }: IProps) => {
  return (
    <span className="text-sm">
      {name}
      <span className="text-bk7">({formatFloorNumber(num)}F)</span>
    </span>
  );
};
