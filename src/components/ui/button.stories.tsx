import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";

const meta = {
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    variant: {
      control: "select",
      options: ["default", "destructive", "ghost", "link", "outline", "secondary"],
    },
  },
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Button",
    variant: "outline",
  },
};

export const GHOST: Story = {
  args: {
    children: "Button",
    variant: "ghost",
  },
};

export const LINK: Story = {
  args: {
    children: "Button",
    variant: "link",
  },
};

export const Disabled: Story = {
  args: {
    children: "Button",
    disabled: true,
    variant: "default",
  },
};
