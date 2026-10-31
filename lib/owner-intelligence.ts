import { greenhouses, harvests, orders, tasks } from "./demo-data";
import { buildHarvestDemandPlan } from "./harvest-demand-engine";

const riskWeight = { high: 3, watch: 2, good: 1 } as const;

function demandPlan() {
  return buildHarvestDemandPlan(
    harvests.map((item) => ({
      id: item.id,
      sku: item.sku,
      crop: item.crop,
      greenhouse: item.greenhouse,
      availableOn: item.availableOn,
      forecast: item.forecast,
      confirmedAvailable: item.confirmedAvailable,
    })),
    orders.map((item) => ({
      id: item.id,
      sku: item.sku,
      item: item.item,
      buyer: item.buyer,
      dueOn: item.dueOn,
      quantity: item.qty,
      value: item.value,
    })),
  );
}

export function buildOwnerSnapshot() {
  const plan = demandPlan();
  const revenue = orders.reduce((sum, item) => sum + item.value, 0);
  const topGap = [...plan.orders].sort(
    (a, b) => b.shortfall - a.shortfall || b.revenueAtRisk - a.revenueAtRisk,
  )[0];
  const topRisk = [...greenhouses].sort(
    (a, b) => riskWeight[b.risk] - riskWeight[a.risk] || a.health - b.health,
  )[0];
  const urgentTasks = tasks.filter((task) => task.priority === "Ưu tiên cao").length;

  if (topGap?.shortfall) {
    const greenhouse = greenhouses.find((item) => item.sku === topGap.sku);
    return {
      forecast: plan.summary.forecast,
      revenue,
      gap: plan.summary.shortfall,
      revenueAtRisk: plan.summary.revenueAtRisk,
      urgentTasks,
      brief: {
        headline: topGap.item + " đang thiếu " + topGap.shortfall.toLocaleString("vi-VN") + " cành cho đơn " + formatOwnerShortDate(topGap.dueOn) + ".",
        detail: (greenhouse?.name ?? "Nguồn hiện có") + " dự kiến " + (greenhouse?.forecast ?? topGap.allocated).toLocaleString("vi-VN") + " cành. Nguồn chắc chắn đúng hạn mới đáp ứng " + topGap.allocated.toLocaleString("vi-VN") + "/" + topGap.quantity.toLocaleString("vi-VN") + " cành của " + topGap.buyer + ".",
        href: "/orders",
        action: "Xử lý thiếu nguồn",
      },
    };
  }

  return {
    forecast: plan.summary.forecast,
    revenue,
    gap: plan.summary.shortfall,
    revenueAtRisk: plan.summary.revenueAtRisk,
    urgentTasks,
    brief: {
      headline: topRisk
        ? topRisk.name + " · " + topRisk.crop + " là khu cần theo dõi sát nhất."
        : "Nguồn hoa hiện chưa có cảnh báo thiếu.",
      detail: topRisk?.note ?? "Chưa có dữ liệu rủi ro sản xuất cần xử lý.",
      href: "/greenhouses",
      action: "Xem sức khỏe vườn",
    },
  };
}

export function formatOwnerDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return value.day + " · " + value.month + " · " + value.year;
}

function formatOwnerShortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value + "T00:00:00Z"));
}
