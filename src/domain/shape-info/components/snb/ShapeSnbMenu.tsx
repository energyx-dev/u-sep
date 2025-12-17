import { useNavigate } from "react-router-dom";

import { ShapeTree } from "@/components/custom/ShapeTree";
import { ERemodelingType } from "@/enums/ERemodelingType";

export const ShapeSnbMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-[4px] border bg-white p-3">
      <ShapeTree
        depth="surface"
        onItemClick={({ depth, id, remodelingType }) => {
          if (depth === "version") {
            navigate(`/remodeling/${remodelingType}/building-overview`);
          } else {
            navigate(`/remodeling/${remodelingType}/shape-info/${depth}s/${id}`);
          }
        }}
        remodelingType={ERemodelingType.BEFORE}
        selectionType="none"
      />
      <ShapeTree
        depth="surface"
        onItemClick={({ depth, id, remodelingType }) => {
          if (depth === "version") {
            navigate(`/remodeling/${remodelingType}/building-overview`);
          } else {
            navigate(`/remodeling/${remodelingType}/shape-info/${depth}s/${id}`);
          }
        }}
        remodelingType={ERemodelingType.AFTER}
        selectionType="none"
      />
    </div>
  );
};
