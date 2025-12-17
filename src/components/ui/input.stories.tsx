import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/ui/input";

const meta = {
  argTypes: {
    disabled: {
      control: "boolean",
    },
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url"],
    },
  },
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Input",
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    type: "text",
  },
};

export const Password: Story = {
  args: {
    placeholder: "Enter password...",
    type: "password",
  },
};

export const Email: Story = {
  args: {
    placeholder: "Enter email...",
    type: "email",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    type: "text",
  },
};

export const WithError: Story = {
  args: {
    className: "border-red-500 focus-visible:ring-red-500",
    placeholder: "Input with error",
    type: "text",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label className="text-sm font-medium" htmlFor="email">
        Email
      </label>
      <Input id="email" placeholder="Enter your email" type="email" />
    </div>
  ),
};
