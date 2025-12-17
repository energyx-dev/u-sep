import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComboboxProps {
  placeholders?: { combobox: string; search: string };
  selectedValue: string[];
  setSelectedValue: (value: string[]) => void;
  values: { label: string; value: string }[];
}

export const ComboboxMultiple = ({
  placeholders = { combobox: "", search: "" },
  selectedValue,
  setSelectedValue,
  values,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild className="">
        <Button
          aria-expanded={open}
          className="border-border w-[462px] justify-between border text-sm text-black"
          role="combobox"
          variant="outline"
        >
          <span className="truncate overflow-hidden whitespace-nowrap">
            {selectedValue.length > 0
              ? selectedValue.map((val) => values.find((f) => f.value === val)?.label).join(", ")
              : "층 선택"}
          </span>
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[462px] p-0">
        <Command>
          <CommandInput placeholder={placeholders?.search} />
          <CommandList>
            <CommandEmpty />
            <CommandGroup>
              {values.map(({ label, value }) => (
                <CommandItem
                  key={value}
                  onSelect={() => {
                    const nextValue = selectedValue.includes(value)
                      ? selectedValue.filter((v) => v !== value)
                      : [...selectedValue, value];
                    setSelectedValue(nextValue);
                  }}
                  value={label}
                >
                  <Checkbox checked={selectedValue.includes(value)} />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
