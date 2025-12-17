import { PlusIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ESourceSystemType } from "@/domain/systems/source/constants/sourceSystem.enums";
import { ESupplySystemType } from "@/domain/systems/supply/constants/supplySystem.enums";

interface IProps {
  items: {
    label: string;
    type: ESourceSystemType | ESupplySystemType;
  }[];
  onSelect: (value: string) => void;
  triggerLabel?: string;
}

export const NewAddSystemSelect = ({ items, onSelect, triggerLabel = "설비 추가" }: IProps) => {
  return items.length > 0 ? (
    <Select onValueChange={onSelect}>
      <SelectTrigger
        className="bg-neutral080 data-[placeholder]:text-neutral560 hover:bg-neutral160 cursor-pointer gap-1 border-none p-2 text-sm"
        iconClassName="hidden"
      >
        <PlusIcon className="text-neutral560" style={{ height: 14, width: 14 }} />
        <Label className="cursor-pointer">{triggerLabel}</Label>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ label, type }) => (
            <SelectItem
              className="text-neutral640 data-[highlighted]:bg-neutral040 text-sm"
              key={type}
              value={type}
            >
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ) : null;
};
