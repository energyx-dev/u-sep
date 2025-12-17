import type { Meta, StoryObj } from "@storybook/react";

import { cn } from "@/lib/utils";
import { themeColor } from "@/styles/themeColor";

const meta = {
  title: "Design System/Colors",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ColorBox = ({ color: color, name }: { color: string; name: string }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("h-30 w-30 rounded-lg border")} style={{ backgroundColor: color }} />
      <div className="text-sm font-medium">{name}</div>
    </div>
  );
};

export const Colors: Story = {
  render: () => {
    return (
      <>
        <h1 className="mb-8 text-3xl font-bold">Color Palette</h1>
        <div className="flex flex-wrap gap-8">
          {Object.entries(themeColor).map(([name, value]) => (
            <ColorBox color={value} key={name} name={name} />
          ))}
        </div>
      </>
    );
  },
};
