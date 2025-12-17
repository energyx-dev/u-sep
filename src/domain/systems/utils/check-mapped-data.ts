import { TFenestrationEngineAndGuiSchema } from "@/domain/fenestration/schemas/fenestration.schema";
import { TFloorGuiSchema } from "@/domain/shape-info/schemas/floor/floor.schema";
import { TSurfaceConstructionTable } from "@/domain/surface-constructions/helper/helper.util";
import { TLightningDensityGuiSchema } from "@/domain/systems/lightning/schemas/lightning-density.schema";
import { TLightningGuiSchema } from "@/domain/systems/lightning/schemas/lightning.schema";
import { TPhotovoltaicSystemEngineAndGuiSchema } from "@/domain/systems/renewable/photovoltaic/schemas/photovoltaic.schema";
import { AnySupplyRow } from "@/domain/systems/supply/components/SupplySystemTableSection";
import { TVentilationEngineAndGuiSchema } from "@/domain/systems/ventilation/schemas/ventilation-system.schema";
import { TTemplateReference } from "@/types/template.types";

export type TAffectedZone = {
  floorName?: string;
  version: "AFTER" | "BEFORE";
  zoneId: string;
  zoneName?: string;
};

export const checkLightningMapping = (
  deletedIds: string[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
): { affectedZones: TAffectedZone[]; deletedLightnings: TLightningGuiSchema[] } => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedLightningsMap = new Map<string, TLightningGuiSchema>();

  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneLightnings = zone.lightning ?? [];
      const matchedLightnings = zoneLightnings.filter((l) => deletedIds.includes(l.id));

      if (matchedLightnings.length > 0) {
        matchedLightnings.forEach((l) => deletedLightningsMap.set(l.id, l));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "BEFORE",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneLightnings = zone.lightning ?? [];
      const matchedLightnings = zoneLightnings.filter((l) => deletedIds.includes(l.id));

      if (matchedLightnings.length > 0) {
        matchedLightnings.forEach((l) => deletedLightningsMap.set(l.id, l));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "AFTER",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  return { affectedZones, deletedLightnings: Array.from(deletedLightningsMap.values()) };
};

export const checkLightningDensityMapping = (
  deletedIds: string[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
): { affectedZones: TAffectedZone[]; deletedDensities: TLightningDensityGuiSchema[] } => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedDensitiesMap = new Map<string, TLightningDensityGuiSchema>();

  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneDensities = zone.density ?? [];
      const matchedDensities = zoneDensities.filter((l) => deletedIds.includes(l.id));

      if (matchedDensities.length > 0) {
        matchedDensities.forEach((l) => deletedDensitiesMap.set(l.id, l));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "BEFORE",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneDensities = zone.density ?? [];
      const matchedDensities = zoneDensities.filter((l) => deletedIds.includes(l.id));

      if (matchedDensities.length > 0) {
        matchedDensities.forEach((l) => deletedDensitiesMap.set(l.id, l));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "AFTER",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  return { affectedZones, deletedDensities: Array.from(deletedDensitiesMap.values()) };
};

export const checkPhotovoltaicSystemMapping = (
  deletedIds: string[],
  beforeRemodel: TTemplateReference[],
  afterRemodel: TTemplateReference[],
  data?: TPhotovoltaicSystemEngineAndGuiSchema[],
): {
  affectedZones: TAffectedZone[];
  deletedPhotovoltaicSystem: TPhotovoltaicSystemEngineAndGuiSchema[];
} => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedPhotovoltaicSystemMap = new Map<string, TPhotovoltaicSystemEngineAndGuiSchema>();

  beforeRemodel.forEach((photovoltaic) => {
    const hasDeletedPhotovoltaicSystem = data?.find((p) => p.id === photovoltaic.id);
    const matchedPhotovoltaic =
      hasDeletedPhotovoltaicSystem && deletedIds.includes(hasDeletedPhotovoltaicSystem.id);

    if (matchedPhotovoltaic) {
      deletedPhotovoltaicSystemMap.set(
        hasDeletedPhotovoltaicSystem.id,
        hasDeletedPhotovoltaicSystem,
      );

      if (!seenZoneIds.has(photovoltaic.id)) {
        seenZoneIds.add(photovoltaic.id);
        affectedZones.push({
          version: "BEFORE",
          zoneId: photovoltaic.id,
        });
      }
    }
  });

  afterRemodel.forEach((photovoltaic) => {
    const hasDeletedPhotovoltaicSystem = data?.find((p) => p.id === photovoltaic.id);
    const matchedPhotovoltaic =
      hasDeletedPhotovoltaicSystem && deletedIds.includes(hasDeletedPhotovoltaicSystem.id);

    if (matchedPhotovoltaic) {
      deletedPhotovoltaicSystemMap.set(
        hasDeletedPhotovoltaicSystem.id,
        hasDeletedPhotovoltaicSystem,
      );

      if (!seenZoneIds.has(photovoltaic.id)) {
        seenZoneIds.add(photovoltaic.id);
        affectedZones.push({
          version: "AFTER",
          zoneId: photovoltaic.id,
        });
      }
    }
  });

  return {
    affectedZones,
    deletedPhotovoltaicSystem: Array.from(deletedPhotovoltaicSystemMap.values()),
  };
};

export const checkVentilationMapping = (
  deletedIds: string[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
  data?: TVentilationEngineAndGuiSchema[],
): {
  affectedZones: TAffectedZone[];
  deletedVentilationSystem: TVentilationEngineAndGuiSchema[];
} => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedVentilationSystemMap = new Map<string, TVentilationEngineAndGuiSchema>();

  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const hasDeletedVentilationSystem = data?.find((v) => v.id === zone.ventilation_system_id);
      const matchedVentilattionSystem =
        hasDeletedVentilationSystem && deletedIds.includes(hasDeletedVentilationSystem.id);

      if (matchedVentilattionSystem) {
        deletedVentilationSystemMap.set(
          hasDeletedVentilationSystem.id,
          hasDeletedVentilationSystem,
        );

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "BEFORE",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const hasDeletedVentilationSystem = data?.find((v) => v.id === zone.ventilation_system_id);
      const matchedVentilattionSystem =
        hasDeletedVentilationSystem && deletedIds.includes(hasDeletedVentilationSystem.id);

      if (matchedVentilattionSystem) {
        deletedVentilationSystemMap.set(
          hasDeletedVentilationSystem.id,
          hasDeletedVentilationSystem,
        );

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "AFTER",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  return {
    affectedZones,
    deletedVentilationSystem: Array.from(deletedVentilationSystemMap.values()),
  };
};

export const checkSupplySystemMapping = (
  deletedIds: string[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
  data?: Partial<AnySupplyRow>[],
): { affectedZones: TAffectedZone[]; deletedSupplySystem: Partial<AnySupplyRow>[] } => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedSupplySystemMap = new Map<string, Partial<AnySupplyRow>>();
  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneSupplySystems = [zone.supply_system_cooling_id, zone.supply_system_heating_id];
      const matchedSupplySystems = zoneSupplySystems.filter((s) => s && deletedIds.includes(s));

      const matchedSupplySystemsData = data?.filter((s) => matchedSupplySystems.includes(s.id));

      if (matchedSupplySystems.length > 0) {
        matchedSupplySystemsData?.forEach((s) => s && s.id && deletedSupplySystemMap.set(s.id, s));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "BEFORE",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      const zoneSupplySystems = [zone.supply_system_cooling_id, zone.supply_system_heating_id];
      const matchedSupplySystems = zoneSupplySystems.filter((s) => s && deletedIds.includes(s));

      const matchedSupplySystemsData = data?.filter((s) => matchedSupplySystems.includes(s.id));

      if (matchedSupplySystems.length > 0) {
        matchedSupplySystemsData?.forEach((s) => s && s.id && deletedSupplySystemMap.set(s.id, s));

        if (!seenZoneIds.has(zone.id)) {
          seenZoneIds.add(zone.id);
          affectedZones.push({
            floorName: floor.floor_name,
            version: "AFTER",
            zoneId: zone.id,
            zoneName: zone.name,
          });
        }
      }
    });
  });

  return { affectedZones, deletedSupplySystem: Array.from(deletedSupplySystemMap.values()) };
};

export const checkSurfaceConstructionMapping = (
  deletedIds: (string | undefined)[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
  data?: Partial<TSurfaceConstructionTable>[],
): {
  affectedZones: TAffectedZone[];
  deletedSurfaceConstruction: Partial<TSurfaceConstructionTable>[];
} => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedSurfaceConstructionMap = new Map<string, Partial<TSurfaceConstructionTable>>();

  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      zone.surfaces.forEach((surface) => {
        const hasDeletedSurfaceConstruction =
          surface.construction_id && deletedIds.includes(surface.construction_id);
        const matchedSurfaceConstructionData =
          hasDeletedSurfaceConstruction && data?.find((s) => s.id === surface.construction_id);
        if (matchedSurfaceConstructionData) {
          deletedSurfaceConstructionMap.set(
            surface.construction_id,
            matchedSurfaceConstructionData,
          );
          if (!seenZoneIds.has(zone.id)) {
            seenZoneIds.add(zone.id);
            affectedZones.push({
              floorName: floor.floor_name,
              version: "BEFORE",
              zoneId: zone.id,
              zoneName: zone.name,
            });
          }
        }
      });
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      zone.surfaces.forEach((surface) => {
        const hasDeletedSurfaceConstruction =
          surface.construction_id && deletedIds.includes(surface.construction_id);
        const matchedSurfaceConstructionData =
          hasDeletedSurfaceConstruction && data?.find((s) => s.id === surface.construction_id);
        if (matchedSurfaceConstructionData) {
          deletedSurfaceConstructionMap.set(
            surface.construction_id,
            matchedSurfaceConstructionData,
          );
          if (!seenZoneIds.has(zone.id)) {
            seenZoneIds.add(zone.id);
            affectedZones.push({
              floorName: floor.floor_name,
              version: "AFTER",
              zoneId: zone.id,
              zoneName: zone.name,
            });
          }
        }
      });
    });
  });

  return {
    affectedZones,
    deletedSurfaceConstruction: Array.from(deletedSurfaceConstructionMap.values()),
  };
};

export const checkFenestrationMapping = (
  deletedIds: string[],
  beforeGeometry: TFloorGuiSchema[],
  afterGeometry: TFloorGuiSchema[],
  data?: TFenestrationEngineAndGuiSchema[],
): { affectedZones: TAffectedZone[]; deletedFenestration: TFenestrationEngineAndGuiSchema[] } => {
  const affectedZones: TAffectedZone[] = [];
  const seenZoneIds = new Set<string>();
  const deletedFenestrationMap = new Map<string, TFenestrationEngineAndGuiSchema>();
  beforeGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      zone.surfaces.forEach((surface) => {
        surface.fenestrations.forEach((fenestration) => {
          const surfaceFenestration = data?.find((f) => f.id === fenestration.id);
          const hasDeletedFenestration =
            surfaceFenestration && deletedIds.includes(surfaceFenestration.id);
          const matchedFenestrationData = hasDeletedFenestration && surfaceFenestration;

          if (matchedFenestrationData) {
            deletedFenestrationMap.set(surfaceFenestration.id, surfaceFenestration);
            if (!seenZoneIds.has(zone.id)) {
              seenZoneIds.add(zone.id);
              affectedZones.push({
                floorName: floor.floor_name,
                version: "BEFORE",
                zoneId: zone.id,
                zoneName: zone.name,
              });
            }
          }
        });
      });
    });
  });

  afterGeometry.forEach((floor) => {
    floor.zones.forEach((zone) => {
      zone.surfaces.forEach((surface) => {
        surface.fenestrations.forEach((fenestration) => {
          const surfaceFenestration = data?.find((f) => f.id === fenestration.id);
          const hasDeletedFenestration =
            surfaceFenestration && deletedIds.includes(surfaceFenestration.id);
          const matchedFenestrationData = hasDeletedFenestration && surfaceFenestration;

          if (matchedFenestrationData) {
            deletedFenestrationMap.set(surfaceFenestration.id, surfaceFenestration);
            if (!seenZoneIds.has(zone.id)) {
              seenZoneIds.add(zone.id);
              affectedZones.push({
                floorName: floor.floor_name,
                version: "AFTER",
                zoneId: zone.id,
                zoneName: zone.name,
              });
            }
          }
        });
      });
    });
  });

  return { affectedZones, deletedFenestration: Array.from(deletedFenestrationMap.values()) };
};
