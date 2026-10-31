export type SupplyLot = {
  id: string;
  sku: string;
  crop: string;
  greenhouse: string;
  availableOn: string;
  forecast: number;
  confirmedAvailable: number;
};

export type DemandOrder = {
  id: string;
  sku: string;
  item: string;
  buyer: string;
  dueOn: string;
  quantity: number;
  value: number;
};

export type OrderCoverage = DemandOrder & {
  allocated: number;
  shortfall: number;
  coveragePercent: number;
  revenueAtRisk: number;
  status: "COVERED" | "SHORTAGE";
};

export type CropBalance = {
  sku: string;
  crop: string;
  forecast: number;
  confirmedAvailable: number;
  demand: number;
  allocatedByDue: number;
  dueGap: number;
  horizonSurplus: number;
  revenueAtRisk: number;
};

export type HarvestDemandPlan = {
  orders: OrderCoverage[];
  crops: CropBalance[];
  summary: {
    forecast: number;
    confirmedAvailable: number;
    demand: number;
    allocatedByDue: number;
    shortfall: number;
    ordersAtRisk: number;
    revenueAtRisk: number;
  };
};

function assertIsoDate(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value + "T00:00:00Z"))) {
    throw new Error(label + "_INVALID_DATE");
  }
}

function assertQuantity(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(label + "_INVALID_QUANTITY");
}

function assertIdentity(value: string, label: string) {
  if (!value || value !== value.trim()) throw new Error(label + "_INVALID_IDENTITY");
}

function assertUniqueIds(items: readonly { id: string }[], label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(label + "_DUPLICATE_ID");
    seen.add(item.id);
  }
}

export function buildHarvestDemandPlan(
  supplyLots: readonly SupplyLot[],
  demandOrders: readonly DemandOrder[],
): HarvestDemandPlan {
  assertUniqueIds(supplyLots, "SUPPLY");
  assertUniqueIds(demandOrders, "ORDER");

  for (const lot of supplyLots) {
    assertIdentity(lot.id, "SUPPLY_ID");
    assertIdentity(lot.sku, "SUPPLY_SKU");
    assertIsoDate(lot.availableOn, "SUPPLY");
    assertQuantity(lot.forecast, "SUPPLY_FORECAST");
    assertQuantity(lot.confirmedAvailable, "SUPPLY_CONFIRMED");
    if (lot.confirmedAvailable > lot.forecast) throw new Error("SUPPLY_CONFIRMED_EXCEEDS_FORECAST");
  }

  for (const order of demandOrders) {
    assertIdentity(order.id, "ORDER_ID");
    assertIdentity(order.sku, "ORDER_SKU");
    assertIsoDate(order.dueOn, "ORDER");
    assertQuantity(order.quantity, "ORDER_QUANTITY");
    assertQuantity(order.value, "ORDER_VALUE");
  }

  const remaining = new Map(supplyLots.map((lot) => [lot.id, lot.confirmedAvailable]));
  const sortedOrders = [...demandOrders].sort(
    (left, right) => left.dueOn.localeCompare(right.dueOn) || left.id.localeCompare(right.id),
  );
  const sortedSupply = [...supplyLots].sort(
    (left, right) => left.availableOn.localeCompare(right.availableOn) || left.id.localeCompare(right.id),
  );

  const coverageById = new Map<string, OrderCoverage>();

  for (const order of sortedOrders) {
    let needed = order.quantity;
    let allocated = 0;

    for (const lot of sortedSupply) {
      if (lot.sku !== order.sku || lot.availableOn > order.dueOn || needed <= 0) continue;
      const available = remaining.get(lot.id) ?? 0;
      if (available <= 0) continue;
      const take = Math.min(available, needed);
      remaining.set(lot.id, available - take);
      allocated += take;
      needed -= take;
    }

    const shortfall = Math.max(0, order.quantity - allocated);
    const coveragePercent = order.quantity === 0 ? 100 : Math.min(100, (allocated / order.quantity) * 100);
    const revenueAtRisk = order.quantity === 0 ? 0 : Math.round(order.value * (shortfall / order.quantity));

    coverageById.set(order.id, {
      ...order,
      allocated,
      shortfall,
      coveragePercent,
      revenueAtRisk,
      status: shortfall > 0 ? "SHORTAGE" : "COVERED",
    });
  }

  const orders = demandOrders.map((order) => coverageById.get(order.id)!);
  const skus = [...new Set([...supplyLots.map((lot) => lot.sku), ...demandOrders.map((order) => order.sku)])];

  const crops = skus.map((sku) => {
    const lots = supplyLots.filter((lot) => lot.sku === sku);
    const matchingOrders = orders.filter((order) => order.sku === sku);
    const forecast = lots.reduce((sum, lot) => sum + lot.forecast, 0);
    const confirmedAvailable = lots.reduce((sum, lot) => sum + lot.confirmedAvailable, 0);
    const demand = matchingOrders.reduce((sum, order) => sum + order.quantity, 0);
    const allocatedByDue = matchingOrders.reduce((sum, order) => sum + order.allocated, 0);
    const dueGap = matchingOrders.reduce((sum, order) => sum + order.shortfall, 0);
    const revenueAtRisk = matchingOrders.reduce((sum, order) => sum + order.revenueAtRisk, 0);

    return {
      sku,
      crop: lots[0]?.crop ?? matchingOrders[0]?.item ?? sku,
      forecast,
      confirmedAvailable,
      demand,
      allocatedByDue,
      dueGap,
      horizonSurplus: Math.max(0, confirmedAvailable - allocatedByDue),
      revenueAtRisk,
    };
  }).sort((left, right) => right.dueGap - left.dueGap || right.demand - left.demand || left.sku.localeCompare(right.sku));

  return {
    orders,
    crops,
    summary: {
      forecast: supplyLots.reduce((sum, lot) => sum + lot.forecast, 0),
      confirmedAvailable: supplyLots.reduce((sum, lot) => sum + lot.confirmedAvailable, 0),
      demand: demandOrders.reduce((sum, order) => sum + order.quantity, 0),
      allocatedByDue: orders.reduce((sum, order) => sum + order.allocated, 0),
      shortfall: orders.reduce((sum, order) => sum + order.shortfall, 0),
      ordersAtRisk: orders.filter((order) => order.shortfall > 0).length,
      revenueAtRisk: orders.reduce((sum, order) => sum + order.revenueAtRisk, 0),
    },
  };
}

export function formatPlanningDate(value: string) {
  assertIsoDate(value, "DISPLAY");
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}
