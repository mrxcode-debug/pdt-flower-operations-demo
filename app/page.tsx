import Link from "next/link";
import { greenhouses, tasks, money } from "../lib/demo-data";
import { buildOwnerSnapshot } from "../lib/owner-intelligence";

export const dynamic = "force-dynamic";

export default function Home() {
  const snapshot = buildOwnerSnapshot();

  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="kicker">OWNER COMMAND CENTER · DỮ LIỆU MẪU</span>
          <h1>Điều hành vườn trong 30 giây.</h1>
          <p>Thu hoạch, đơn hàng, rủi ro và việc cần chốt — gom về một màn hình.</p>
        </div>
        <div className="datePill">Demo scenario · Sep 2026</div>
      </section>

      <section className="brief">
        <div>
          <span className="kicker">OWNER BRIEF · ZERO-LLM</span>
          <h2>{snapshot.brief.headline}</h2>
          <p>{snapshot.brief.detail}</p>
        </div>
        <Link href={snapshot.brief.href}>{snapshot.brief.action} →</Link>
      </section>

      <section className="metrics">
        <article>
          <span>SẮP THU</span>
          <strong>{snapshot.forecast.toLocaleString("vi-VN")}</strong>
          <small>cành dự kiến</small>
        </article>
        <article>
          <span>THIẾU NGUỒN</span>
          <strong>{snapshot.gap.toLocaleString("vi-VN")}</strong>
          <small>cành đã có đơn</small>
        </article>
        <article>
          <span>GIÁ TRỊ ĐƠN</span>
          <strong>{money(snapshot.revenue)}</strong>
          <small>đang theo dõi</small>
        </article>
        <article>
          <span>VIỆC HÔM NAY</span>
          <strong>{tasks.length}</strong>
          <small>{snapshot.urgentTasks} việc ưu tiên cao</small>
        </article>
      </section>

      <section className="sectionHead">
        <div>
          <span className="kicker">SẢN XUẤT</span>
          <h2>Nhà kính cần chú ý</h2>
        </div>
        <Link href="/greenhouses">Xem tất cả</Link>
      </section>

      <section className="cards">
        {greenhouses.map((item) => (
          <article className="card" key={item.id}>
            <div className="row">
              <span>{item.name}</span>
              <b className={"risk " + item.risk}>{item.stage}</b>
            </div>
            <h3>{item.crop}</h3>
            <p>
              Thu dự kiến <strong>{item.harvest}</strong>
            </p>
            <div className="health">
              <i style={{ width: item.health + "%" }} />
            </div>
            <footer>
              <span>{item.forecast.toLocaleString("vi-VN")} cành</span>
              <em>{item.note}</em>
            </footer>
          </article>
        ))}
      </section>

      <section className="sectionHead">
        <div>
          <span className="kicker">HÀNH ĐỘNG</span>
          <h2>Hôm nay cần làm gì?</h2>
        </div>
      </section>

      <section className="taskList">
        {tasks.map((task, index) => (
          <article key={task.title}>
            <i>{index + 1}</i>
            <div>
              <strong>{task.title}</strong>
              <span>{task.detail}</span>
            </div>
            <b>{task.priority}</b>
          </article>
        ))}
      </section>
    </div>
  );
}
