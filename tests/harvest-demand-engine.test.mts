import assert from "node:assert/strict";
import { buildHarvestDemandPlan } from "../lib/harvest-demand-engine.ts";

const plan = buildHarvestDemandPlan(
  [
    { id: "s-early", sku: "rose", crop: "Rose", greenhouse: "A1", availableOn: "2026-09-24", forecast: 1000, confirmedAvailable: 600 },
    { id: "s-late", sku: "rose", crop: "Rose", greenhouse: "A2", availableOn: "2026-09-28", forecast: 500, confirmedAvailable: 500 },
    { id: "s-carnation", sku: "carnation", crop: "Carnation", greenhouse: "C1", availableOn: "2026-09-25", forecast: 700, confirmedAvailable: 700 }
  ],
  [
    { id: "o-first", sku: "rose", item: "Rose", buyer: "Buyer A", dueOn: "2026-09-24", quantity: 700, value: 7_000_000 },
    { id: "o-second", sku: "rose", item: "Rose", buyer: "Buyer B", dueOn: "2026-09-29", quantity: 300, value: 3_000_000 },
    { id: "o-no-source", sku: "lily", item: "Lily", buyer: "Buyer C", dueOn: "2026-09-26", quantity: 100, value: 2_000_000 }
  ],
);

const first = plan.orders.find((item) => item.id === "o-first");
const second = plan.orders.find((item) => item.id === "o-second");
const noSource = plan.orders.find((item) => item.id === "o-no-source");

assert.equal(first?.allocated, 600, "supply arriving after due date must not certify the first order");
assert.equal(first?.shortfall, 100);
assert.equal(first?.revenueAtRisk, 1_000_000);
assert.equal(second?.allocated, 300, "later order can use the later supply lot");
assert.equal(second?.shortfall, 0);
assert.equal(noSource?.shortfall, 100, "unknown SKU must fail closed with full shortfall");
assert.equal(plan.summary.ordersAtRisk, 2);
assert.equal(plan.summary.shortfall, 200);
assert.equal(plan.summary.revenueAtRisk, 3_000_000);

const rose = plan.crops.find((item) => item.sku === "rose");
assert.equal(rose?.confirmedAvailable, 1100);
assert.equal(rose?.allocatedByDue, 900);
assert.equal(rose?.dueGap, 100);
assert.equal(rose?.horizonSurplus, 200);

assert.throws(
  () => buildHarvestDemandPlan(
    [{ id: "bad", sku: "rose", crop: "Rose", greenhouse: "A1", availableOn: "2026-09-24", forecast: 100, confirmedAvailable: 101 }],
    [],
  ),
  /SUPPLY_CONFIRMED_EXCEEDS_FORECAST/,
  "confirmed supply cannot exceed forecast",
);

assert.throws(
  () => buildHarvestDemandPlan(
    [],
    [
      { id: "dup", sku: "rose", item: "Rose", buyer: "A", dueOn: "2026-09-24", quantity: 1, value: 1 },
      { id: "dup", sku: "rose", item: "Rose", buyer: "B", dueOn: "2026-09-25", quantity: 1, value: 1 }
    ],
  ),
  /ORDER_DUPLICATE_ID/,
  "duplicate demand identity must fail closed",
);

console.log("Harvest & Demand Intelligence contract scenarios: PASS");
