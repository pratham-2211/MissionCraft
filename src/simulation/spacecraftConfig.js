
/**
 * MissionCraft - Spacecraft Configuration
 *
 * All component values are illustrative game values,
 * not official NASA specifications.
 */

export const COMPONENT_CATALOG = [
  {
    id: "rocket",
    name: "Launch Vehicle",
    category: "launch",
    cost: 5000000,
    massKg: 0,
    description: "Provides launch service."
  },
  {
    id: "spacecraft-bus",
    name: "Spacecraft Bus",
    category: "structure",
    cost: 200000,
    massKg: 150,
    description: "Main spacecraft structure."
  },
  {
    id: "fuel-tank",
    name: "Fuel Tank",
    category: "propulsion",
    cost: 100000,
    massKg: 50,
    fuelCapacityKg: 500,
    description: "Stores spacecraft fuel."
  },
  {
    id: "solar-panel",
    name: "Solar Panel",
    category: "power",
    cost: 80000,
    massKg: 20,
    powerGenerationW: 500,
    description: "Generates electrical power."
  },
  {
    id: "battery",
    name: "Battery",
    category: "power",
    cost: 50000,
    massKg: 15,
    batteryCapacityWh: 2000,
    description: "Stores electrical energy."
  },
  {
    id: "camera",
    name: "Scientific Camera",
    category: "science",
    cost: 60000,
    massKg: 10,
    powerConsumptionW: 100,
    description: "Collects scientific images."
  },
  {
    id: "antenna",
    name: "Communication Antenna",
    category: "communication",
    cost: 40000,
    massKg: 8,
    powerConsumptionW: 50,
    description: "Enables communication."
  }
];

export function createInitialSpacecraftConfig() {
  return {
    name: "My Spacecraft",
    selectedComponentIds: [],
    fuelKg: 0
  };
}

export function addComponent(config, componentId) {
  const componentExists = COMPONENT_CATALOG.some(
    (component) => component.id === componentId
  );

  if (!componentExists) {
    throw new Error(`Component not found: ${componentId}`);
  }

  if (config.selectedComponentIds.includes(componentId)) {
    return config;
  }

  return {
    ...config,
    selectedComponentIds: [
      ...config.selectedComponentIds,
      componentId
    ]
  };
}

export function removeComponent(config, componentId) {
  return {
    ...config,
    selectedComponentIds: config.selectedComponentIds.filter(
      (id) => id !== componentId
    )
  };
}

export function updateFuel(config, fuelKg) {
  if (!Number.isFinite(fuelKg) || fuelKg < 0) {
    throw new Error("Fuel must be a valid non-negative number.");
  }

  return {
    ...config,
    fuelKg
  };
}

export function getSelectedComponents(config) {
  return COMPONENT_CATALOG.filter((component) =>
    config.selectedComponentIds.includes(component.id)
  );
}
