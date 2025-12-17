import { themeColor } from "@/styles/themeColor";

interface IProps {
  isActive: boolean;
}

export const DirectionArrow = ({ isActive }: IProps) => {
  return (
    <div className="flex flex-col justify-center gap-1">
      <ArrowSvg isActive={isActive} />
    </div>
  );
};

const ArrowSvg = ({ isActive }: { isActive: boolean }) => {
  return (
    <svg fill="none" height="42" viewBox="0 0 24 42" width="24" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_6505_90334)">
        <path
          d="M13.1523 7.26953L20.9988 21.0008L13.1523 34.732"
          stroke={isActive ? themeColor.primary : themeColor.neutral320}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.61547"
        />
        <path
          d="M4 7.26953L11.8464 21.0008L4 34.732"
          stroke={isActive ? themeColor.primary : themeColor.neutral320}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.61547"
        />
      </g>
      <defs>
        <clipPath id="clip0_6505_90334">
          <rect fill="white" height="24" transform="matrix(0 1 -1 0 24 0)" width="42" />
        </clipPath>
      </defs>
    </svg>
  );
};
