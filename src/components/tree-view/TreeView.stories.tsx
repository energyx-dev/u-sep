import { Meta } from "@storybook/react";
import { useState } from "react";

import { TreeView } from "@/components/tree-view/TreeView";
import { buildingTreeData } from "@/pages/test/building-tree-mock";

const meta = {
  component: TreeView,
  title: "Custom/TreeView",
} satisfies Meta<typeof TreeView>;

export default meta;

export const Example = () => {
  const [selectedId, setSelectedItemId] = useState<string>();

  return (
    <TreeView
      className="p-0"
      data={buildingTreeData}
      handleSelectChange={({ id }) => setSelectedItemId(id)}
      selectedItemId={selectedId}
    />
  );
};
