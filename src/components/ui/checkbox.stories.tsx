import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@/components/ui/checkbox";

const meta = {
  argTypes: {
    disabled: {
      control: "boolean",
    },
  },
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "checkbox",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor="terms"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    id: "checkbox-disabled",
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    id: "checkbox-checked",
  },
};
