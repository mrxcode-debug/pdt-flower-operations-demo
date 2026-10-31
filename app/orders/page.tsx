import { harvests, money, orders } from "../../lib/demo-data";
import { buildHarvestDemandPlan, formatPlanningDate } from "../../lib/harvest-demand-engine";

export default function Orders() {
  const plan = buildHarvestDemandPlan(
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

  return (
    <div className="page">
      <section className="hero compact">
        <div>
          <span className="kicker">ĐƠN HÀNG · DEMAND INTELLIGENCE</span>
          <h1>Nhu cầu & khả năng đáp ứng</h1>
          <p>Phân bổ nguồn chắc chắn theo hạn giao; nguồn đến sau hạn không được tính là đã đáp ứng.</p>
        </div>
      </section>

      <section className="metrics">
        <article><span>NHU CẦU</span><strong>{plan.summary.demand.toLocaleString("vi-VN")}</strong><small>cành đã nhận đơn</small></article>
        <article><span>ĐÚNG HẠN</span><strong>{plan.summary.allocatedByDue.toLocaleString("vi-VN")}</strong><small>cành đã có nguồn</small></article>
        <article><span>THIẾU NGUỒN</span><strong>{plan.summary.shortfall.toLocaleString("vi-VN")}</strong><small>{plan.summary.ordersAtRisk} đơn có rủi ro</small></article>
        <article><span>DOANH THU RỦI RO</span><strong>{money(plan.summary.revenueAtRisk)}</strong><small>tỷ lệ theo phần thiếu</small></article>
      </section>

      <section className="tableList">
        {plan.orders.map((order) => (
          <article key={order.id}>
            <div>
              <strong>{order.buyer}</strong>
              <span>{order.item} · giao {formatPlanningDate(order.dueOn)} · phủ {Math.round(order.coveragePercent)}%</span>
            </div>
            <div>
              <b>{money(order.value)}</b>
              <span className={order.shortfall ? "bad" : "good"}>
                {order.shortfall
                  ? "Thiếu " + order.shortfall.toLocaleString("vi-VN") + " cành · rủi ro " + money(order.revenueAtRisk)
                  : "Đủ nguồn đúng hạn"}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
