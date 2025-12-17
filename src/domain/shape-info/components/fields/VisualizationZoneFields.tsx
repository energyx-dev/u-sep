import type { EdgeDefinition, NodeDefinition } from "cytoscape";

import cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";

import { useShapeInfo } from "@/domain/shape-info/hooks/useShapeInfo";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";

const H_SPACING = 220; // 같은 층 내에서 zone 간 가로 간격
const V_SPACING = 375; // 층 간 세로 간격 (충돌 방지 위해 확대)
const SURFACE_OFFSET = 28; // zone과 해당 surface 간 세로 간격
const NODE_WIDTH = 144; // node width used in style
const PORT_INSET = 6; // how far inside the node the port should sit
const PORT_OFFSET = NODE_WIDTH / 2 - PORT_INSET; // place ports INSIDE the node box

// 각 zone 그룹의 세로 위치에 적용할 랜덤 오프셋(0, -25, -50, -75, -100 중 하나)
const JITTER_VALUES = [0, -25, -50, -75, -100];

export const VisualizationZoneFields = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);

  const { shapeInfo } = useShapeInfo();

  const generateElementsFromShapeInfo = (
    shapeInfo: TFloorGuiSchema[],
  ): (EdgeDefinition | NodeDefinition)[] => {
    const elements: (EdgeDefinition | NodeDefinition)[] = [];
    const edgeIds = new Set<string>();
    const nodeIds = new Set<string>();

    // 모든 floor_number를 수집하여 내림차순으로 정렬
    // (존재하지 않는 0층 등으로 인한 간격 벌어짐을 방지하기 위해, 실제 존재하는 층 순서의 랭크를 사용)
    const floors = Array.from(new Set(shapeInfo.map((f) => f.floor_number))).sort((a, b) => b - a);
    const floorIndexMap: Record<number, number> = {};
    floors.forEach((f, idx) => {
      floorIndexMap[f] = idx; // 화면 위에서부터 0,1,2,... 순서로 배치
    });

    // 층별 zone의 가로 배치 인덱스 추적 { floorNo: zoneCount }
    const floorZoneCounts: Record<number, number> = {};
    // zone별 세로 오프셋(한 번 계산하면 동일 렌더 안에서는 고정) { zoneId: jitter }
    const zoneJitterMap: Record<string, number> = {};

    const portsWithEdges = new Set<string>();

    // 1) zone 노드와 해당 zone의 자식 surface 노드를 위치와 함께 생성
    shapeInfo.forEach((floor) => {
      const floorNo = floor.floor_number;
      floor.zones.forEach((zone) => {
        const idxInFloor = floorZoneCounts[floorNo] ?? 0;
        const x = 120 + idxInFloor * H_SPACING;
        const baseY = 120 + (floorIndexMap[floorNo] ?? 0) * V_SPACING; // 실제 존재하는 층 순서(랭크) 기준 배치
        // 0, -25, -50, -75, -100 중 하나를 선택하여 zone 그룹 전체에 동일 적용
        if (zoneJitterMap[zone.id] === undefined) {
          const randIndex = Math.floor(Math.random() * JITTER_VALUES.length);
          zoneJitterMap[zone.id] = JITTER_VALUES[randIndex];
        }
        const y = baseY + zoneJitterMap[zone.id];
        floorZoneCounts[floorNo] = idxInFloor + 1;

        // zone 노드 생성 (부모 노드)
        if (!nodeIds.has(zone.id)) {
          elements.push({
            data: { id: zone.id }, // 부모 라벨 제거 (겹침 방지)
            position: { x, y },
          });
          nodeIds.add(zone.id);
        }

        // zone 헤더 노드(일반 노드) 추가: 부모 내부에 표시
        const headerId = `${zone.id}__header`;
        if (!nodeIds.has(headerId)) {
          elements.push({
            data: {
              id: headerId,
              label: `[${floorNo}F] ${zone.name}`,
              parent: zone.id,
              type: "zoneHeader",
            },
            position: { x, y },
          });
          nodeIds.add(headerId);
        }

        // zone의 자식 surface 노드 생성
        zone.surfaces.forEach((surface, sIdx) => {
          const sy = y + (sIdx + 1) * SURFACE_OFFSET;
          if (!nodeIds.has(surface.id)) {
            elements.push({
              data: { id: surface.id, label: `${surface.name}`, parent: zone.id },
              position: { x, y: sy },
            });
            nodeIds.add(surface.id);
          }

          // add ports for fixed edge endpoints
          const inPortId = `${surface.id}__port_in`;
          if (!nodeIds.has(inPortId)) {
            elements.push({
              data: { id: inPortId, parent: zone.id, type: "port" },
              position: { x: x - PORT_OFFSET + 7, y: sy },
            });
            nodeIds.add(inPortId);
            const inPortInnerId = `${inPortId}__inner`;
            if (!nodeIds.has(inPortInnerId)) {
              elements.push({
                data: { id: inPortInnerId, parent: zone.id, type: "portInner" },
                position: { x: x - PORT_OFFSET + 7, y: sy },
              });
              nodeIds.add(inPortInnerId);
            }
          }
          const outPortId = `${surface.id}__port_out`;
          if (!nodeIds.has(outPortId)) {
            elements.push({
              data: { id: outPortId, parent: zone.id, type: "port" },
              position: { x: x + PORT_OFFSET - 7, y: sy },
            });
            nodeIds.add(outPortId);
            const outPortInnerId = `${outPortId}__inner`;
            if (!nodeIds.has(outPortInnerId)) {
              elements.push({
                data: { id: outPortInnerId, parent: zone.id, type: "portInner" },
                position: { x: x + PORT_OFFSET - 7, y: sy },
              });
              nodeIds.add(outPortInnerId);
            }
          }
        });
      });
    });

    // 2) adjacent_surface_id를 확인하여 인접존 화살표 생성
    shapeInfo.forEach((floor) => {
      floor.zones.forEach((zone) => {
        zone.surfaces.forEach((surface) => {
          const toSurfaceId = surface.adjacent_surface_id;
          if (toSurfaceId && toSurfaceId !== surface.id) {
            const edgeId = `${surface.id}__to__${toSurfaceId}`;
            if (!edgeIds.has(edgeId)) {
              elements.push({
                data: {
                  id: edgeId,
                  source: `${surface.id}__port_out`,
                  target: `${toSurfaceId}__port_in`,
                },
              });
              portsWithEdges.add(`${surface.id}__port_out`);
              portsWithEdges.add(`${toSurfaceId}__port_in`);
              edgeIds.add(edgeId);
            }
          }
        });
      });
    });

    // Mark ports that have at least one edge for styling
    elements.forEach((el: EdgeDefinition | NodeDefinition) => {
      if (el.data) {
        const d = el.data;
        if (d.type === "port") {
          const id = d.id as string;
          if (portsWithEdges.has(id)) {
            d.hasEdge = 1;
            // mirror flag to inner node as well
            const innerId = `${id}__inner`;
            const inner = elements.find((e) => e.data && e.data.id === innerId);
            if (inner && inner.data) {
              inner.data.hasEdge = 1;
            }
          }
        }
      }
    });

    return elements;
  };

  // 화면에 표시되는 노드들의 state
  const [elements, setElements] = useState<(EdgeDefinition | NodeDefinition)[]>([]);

  useEffect(() => {
    if (shapeInfo) {
      setElements(generateElementsFromShapeInfo(shapeInfo));
    }
  }, [shapeInfo]);

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: elements,
      layout: { name: "preset" },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#F5F5F5",
            color: "#808080",
            "font-size": 13,
            shape: "rectangle",
            "text-halign": "center",
            "text-valign": "center",
            width: 144,
            "z-index": 2,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[label]",
          style: {
            label: "data(label)",
          },
        },
        {
          selector: "node:grabbed",
          style: {
            "z-index": 2,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "data(_origBorderColor)",
            "border-width": "data(_origBorderWidth)",
            "overlay-opacity": 0,
          },
        },
        {
          selector: "node[type = 'port']",
          style: {
            "background-color": "#FFFFFF",
            "background-opacity": 1,
            "border-color": "#9CA3AF",
            "border-width": 1,
            events: "no",
            height: 12,
            opacity: 1,
            padding: "1px",
            shape: "ellipse",
            width: 12,
            "z-index": 5,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'port']:grabbed",
          style: {
            "overlay-opacity": 0,
            "z-index": 5,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'portInner']",
          style: {
            "background-color": "#FFFFFF",
            "background-opacity": 1,
            "border-width": 0,
            events: "no",
            height: 10,
            opacity: 1,
            shape: "ellipse",
            width: 10,
            "z-index": 6,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'portInner']:grabbed",
          style: {
            "overlay-opacity": 0,
            "z-index": 6,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'portInner'][hasEdge > 0]",
          style: {
            "background-color": "#84BD00",
          },
        },
        {
          selector: "node[type = 'port'][hasEdge > 0]",
          style: {
            "background-color": "#FFFFFF",
          },
        },
        {
          selector: ":parent",
          style: {
            "background-color": "#F5F5F5",
            "background-opacity": 1,
            "border-color": "#D5D5D5",
            "border-width": 1,
            "compound-sizing-wrt-labels": "exclude",
            padding: "0",
            shape: "rectangle",
            "z-index": 0,
            "z-index-compare": "manual",
          },
        },
        {
          selector: ":parent:grabbed",
          style: {
            "z-index": 0,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'zoneHeader']",
          style: {
            "background-color": "#FFFFFF",
            "border-color": "#007A33",
            color: "#555555",
            "font-size": 13,
            shape: "rectangle",
            "text-halign": "center",
            "text-valign": "center",
            width: 144,
            "z-index": 1,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "node[type = 'zoneHeader']:grabbed",
          style: {
            "overlay-opacity": 0,
            "z-index": 1,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "unbundled-bezier",
            "line-color": "#84BD00",
            width: 2,
            "z-index": 8,
            "z-index-compare": "manual",
          },
        },
        {
          selector: "edge:selected",
          style: {
            "overlay-opacity": 0,
          },
        },
      ],
    });

    cy.autounselectify(true);

    // Make dragging a child node move its parent compound instead
    cy.nodes("node[parent]").grabify();

    cy.on("grab", "node[parent]", (evt) => {
      const n = evt.target; // child
      const p = n.parent();
      if (p && p.length > 0) {
        const group = p.union(p.descendants());
        const startPositions: Record<string, { x: number; y: number }> = {};
        group.forEach((el: cytoscape.SingularElementReturnValue) => {
          if (el.isNode()) {
            const pos = el.position();
            startPositions[el.id()] = { x: pos.x, y: pos.y };
          }
        });
        n.scratch("_dragParent", {
          startChild: { ...n.position() },
          startPositions,
        });
      }
    });

    cy.on("drag", "node[parent]", (evt) => {
      const n = evt.target; // child
      const p = n.parent();
      const s = n.scratch("_dragParent");
      if (!s || !p || p.length === 0) return;
      const cur = n.position();
      const dx = cur.x - s.startChild.x;
      const dy = cur.y - s.startChild.y;

      const group = p.union(p.descendants());
      group.forEach((el: cytoscape.SingularElementReturnValue) => {
        if (el.isNode()) {
          const start = s.startPositions[el.id()];
          if (start) {
            el.position({ x: start.x + dx, y: start.y + dy });
          }
        }
      });
    });

    cy.on("free", "node[parent]", (evt) => {
      const n = evt.target;
      n.removeScratch("_dragParent");
    });

    return () => {
      cy.destroy();
    };
  }, [elements]);

  return <div className="h-[800px] w-full bg-white" ref={cyRef} />;
};
