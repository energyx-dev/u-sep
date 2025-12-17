import { Box, Building, Copy, Square } from "lucide-react";

import { TreeDataItem } from "@/components/tree-view/TreeView";

const iconSet = {
  building: Building,
  ceiling: Square,
  floor: Copy,
  ground: Square,
  wall: Square,
  zone: Box,
};

export const buildingTreeData: TreeDataItem[] = [
  {
    children: [],
    id: "floor-3",
    name: "3층",
  },
  {
    children: [
      {
        children: [
          { icon: iconSet.ceiling, id: "ceiling-1", name: "천장1" },
          { icon: iconSet.ceiling, id: "ceiling-2", name: "천장2" },
          { icon: iconSet.wall, id: "wall-1", name: "벽1" },
          { icon: iconSet.wall, id: "wall-2", name: "벽2" },
          { icon: iconSet.wall, id: "wall-3", name: "벽3" },
          { icon: iconSet.wall, id: "wall-4", name: "벽4" },
          { icon: iconSet.wall, id: "wall-5", name: "벽5" },
          { icon: iconSet.ground, id: "ground-1", name: "바닥1" },
          { icon: iconSet.ground, id: "ground-2", name: "바닥2" },
        ],
        icon: iconSet.zone,
        id: "room-office",
        name: "사무실",
      },
      { icon: iconSet.zone, id: "zone-3", name: "존3" },
      { icon: iconSet.zone, id: "zone-2", name: "존2" },
      { icon: iconSet.zone, id: "zone-1", name: "존1" },
    ],
    id: "floor-2",
    name: "2층",
  },
  {
    children: [],
    id: "floor-1",
    name: "1층",
  },
  {
    children: [],
    id: "basement-1",
    name: "지하1층",
  },
  {
    children: [],
    id: "basement-2",
    name: "지하2층",
  },
];
