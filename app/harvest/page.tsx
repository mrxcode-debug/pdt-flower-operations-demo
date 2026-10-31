import { harvests, orders } from "../../lib/demo-data";
import { buildHarvestDemandPlan, formatPlanningDate } from "../../lib/harvest-demand-engine";

export default function Harvest() {
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
          <span className="kicker">THU HOẠCH · SUPPLY INTELLIGENCE</span>
          <h1>Lịch cắt & nguồn khả dụng</h1>
          <p>Tách sản lượng dự báo khỏi nguồn đã đủ chắc chắn để nhận đơn.</p>
        </div>
      </section>

      <section className="tableList">
        {harvests.map((item) => {
          const balance = plan.crops.find((crop) => crop.sku === item.sku);
          return (
            <article key={item.id}>
              <div>
                <strong>{item.crop}</strong>
                <span>Nhà kính {item.greenhouse} · {formatPlanningDate(item.availableOn)}</span>
              </div>
              <div>
                <b>{item.forecast.toLocaleString("vi-VN")} cành dự báo</b>
                <span className={balance?.dueGap ? "bad" : "good"}>
                  Chắc chắn {item.confirmedAvailable.toLocaleString("vi-VN")}
                  {balance?.dueGap
                    ? " · còn thiếu đúng hạn " + balance.dueGap.toLocaleString("vi-VN")
                    : " · dư sau phân bổ " + (balance?.horizonSurplus ?? item.confirmedAvailable).toLocaleString("vi-VN")}
                </span>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
