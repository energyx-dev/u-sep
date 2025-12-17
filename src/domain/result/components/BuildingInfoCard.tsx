import dayjs from "dayjs";
import { useShallow } from "zustand/shallow";

import { useBuildingInfoStore } from "@/domain/basic-info/stores/building.store";

type TProps = {
  data: {
    address?: string;
    name?: string;
    north_axis?: number;
    total_area: number;
    vintage?: string;
  };
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="text-primary w-[56px] flex-shrink-0 font-semibold">{label}</span>
    <span aria-hidden className="bg-primary h-4 w-px" />
    <span className="text-bk7">{value}</span>
  </div>
);

// const formatArea = (n?: null | number) => {
//   if (typeof n !== "number" || !Number.isFinite(n)) return "-";
//   return `${n.toLocaleString("ko-KR")}m²`;
// };

export const BuildingInfoCard = ({ data }: TProps) => {
  const { address, name, north_axis, total_area, vintage } = data;

  const { buildingInfo } = useBuildingInfoStore(
    useShallow((state) => ({
      buildingInfo: state.buildingInfo,
    })),
  );

  if (!buildingInfo) return null;

  const buildingAddressString = `${buildingInfo.addressRegion} ${buildingInfo.addressDistrict} ${buildingInfo.detailAddress}`;

  return (
    <div className="rounded-md border border-none bg-white">
      <p className="text-bk11 mb-3 text-2xl font-semibold">{name ?? buildingInfo.name}</p>
      <div className="flex gap-12">
        <div className="flex flex-col space-y-2">
          <InfoRow label="주소" value={address ?? buildingAddressString} />
          <InfoRow
            label="허가일자"
            value={vintage ?? dayjs(buildingInfo.vintage).format("YYYY년 M월 D일")}
          />
          <InfoRow label="방위각" value={`${north_axis ?? buildingInfo.north_axis}°`} />
          {/* 용도 등 추가 항목이 생기면 아래처럼 이어서 추가 */}
          <InfoRow label="연면적" value={`${total_area.toLocaleString()}m²`} />
        </div>
      </div>
    </div>
  );
};
