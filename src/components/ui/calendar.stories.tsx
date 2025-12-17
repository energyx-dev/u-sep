import type { Meta, StoryObj } from "@storybook/react";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const meta = {
  argTypes: {
    onChange: { action: "onChange" },
    value: { control: "date" },
  },
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/DatePicker",
} satisfies Meta<typeof DatePicker>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {
  render: () => <DatePicker />,
};

// test 컴포넌트
type TDatePickerProps = {
  className?: string;
  disabled?: (date: Date) => boolean;
  onChange?: (date: Date | undefined) => void;
  value?: Date;
};

function DatePicker({ className, disabled, onChange, value }: TDatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "border-border w-[240px] justify-start pl-3 text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          variant={"monoOutline"}
        >
          <CalendarIcon className="h-4 w-4 opacity-50" />
          {date ? format(date, "PPP") : <span>날짜를 선택하세요</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-md border p-0 shadow">
        <Calendar
          disabled={disabled}
          initialFocus
          mode="single"
          onSelect={handleSelect}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}
