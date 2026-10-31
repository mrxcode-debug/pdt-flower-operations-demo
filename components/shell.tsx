"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

const links = [
  ["/", "Tổng quan"],
  ["/greenhouses", "Nhà kính"],
  ["/harvest", "Thu hoạch"],
  ["/orders", "Đơn hàng"],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <Link className="brandHome" href="/" aria-label="Flower OS · Tổng quan">
          <span className="brandMark">PDT</span>
          <span className="brand">FLOWER OS</span>
        </Link>

        <nav className="desktopNav" aria-label="Điều hướng chính">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="menu"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          aria-controls="flower-mobile-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
      </header>

      <div
        id="flower-mobile-nav"
        className={"mobileNav" + (menuOpen ? " open" : "")}
        hidden={!menuOpen}
      >
        <nav aria-label="Điều hướng mobile">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span>{label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>

      <main>{children}</main>
    </>
  );
}
