"use client";

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

const frameworks = [
  {
    label: "Next.js",
    value: "next.js",
  },
  {
    label: "SvelteKit",
    value: "sveltekit",
  },
  {
    label: "Nuxt.js",
    value: "nuxt.js",
  },
  {
    label: "Remix",
    value: "remix",
  },
  {
    label: "Astro",
    value: "astro",
  },
];

interface ComboboxProps {
  onChange: (value: React.SetStateAction<string[]>) => void;
  value: string[];
}

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          role="combobox"
          variant="outline"
        >
          {selectedValues.length > 0
            ? selectedValues.map((val) => frameworks.find((f) => f.value === val)?.label).join(", ")
            : "Select framework..."}
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  onSelect={(currentValue) => {
                    setSelectedValues((prev) =>
                      prev.includes(currentValue)
                        ? prev.filter((v) => v !== currentValue)
                        : [...prev, currentValue],
                    );
                  }}
                  value={framework.value}
                >
                  <Checkbox checked={selectedValues.includes(framework.value)} />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const ComboboxMultiple = ({ onChange, value }: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="border-border w-full justify-between border text-black"
          role="combobox"
          variant="outline"
        >
          {value.length > 0
            ? value.map((val) => frameworks.find((f) => f.value === val)?.label).join(", ")
            : "층 선택"}
          <ChevronDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  onSelect={(currentValue) => {
                    onChange((prev) =>
                      prev.includes(currentValue)
                        ? prev.filter((v) => v !== currentValue)
                        : [...prev, currentValue],
                    );
                  }}
                  value={framework.value}
                >
                  <Checkbox checked={value.includes(framework.value)} />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
