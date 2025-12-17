import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Typography",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TypographyExample = ({ className, text }: { className: string; text: string }) => {
  return (
    <div className="flex flex-col">
      <div className={className}>{text}</div>
    </div>
  );
};

export const Typography: Story = {
  render: () => {
    const typographyStyles = [
      {
        className: "text-3xl",
        name: "Heading 1",
        text: "2rem - 32px",
      },
      {
        className: "text-2xl",
        name: "Heading 2",
        text: "1.5rem - 24px",
      },
      {
        className: "text-xl",
        name: "Heading 3",
        text: "1.25rem - 20px",
      },
      {
        className: "text-lg",
        name: "Heading 4",
        text: "1.125rem - 18px",
      },
      {
        className: "text-base",
        name: "Body",
        text: "1rem - 16px",
      },
      {
        className: "text-xs",
        name: "Button Text",
        text: "0.75rem - 12px",
      },
      {
        className: "text-2xs",
        name: "Input Text",
        text: "0.625rem - 10px",
      },
    ];

    return (
      <div className="space-y-6 text-xl">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Typography</h1>
          <p className="text-muted-foreground">
            프로젝트에서 사용되는 타이포그라피 스타일 가이드입니다.
          </p>
        </div>

        <div className="space-y-6">
          {typographyStyles.map((style) => (
            <div className="space-y-2 divide-y" key={style.name}>
              <h2 className="text-xl font-semibold">
                {style.name} ({style.className})
              </h2>
              <TypographyExample className={style.className} text={style.text} />
            </div>
          ))}
        </div>

        <div className="space-y-2 divide-y">
          <h2 className="text-xl font-semibold">Font Family</h2>
          <div className="space-y-2">
            <p className="text-base">
              Font: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica
              Neue", Arial, "Noto Sans KR", sans-serif
            </p>
            <p className="text-muted-foreground text-sm">
              웹 폰트로 Pretendard를 사용하며, 시스템 폰트를 fallback으로 설정했습니다.
            </p>
          </div>
        </div>
      </div>
    );
  },
};
