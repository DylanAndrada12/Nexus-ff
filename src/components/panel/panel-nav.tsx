"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PanelNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function PanelNav({ items }: { items: PanelNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex w-full min-w-0 gap-1 overflow-x-auto border-b border-line pb-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:pb-0"
      aria-label="Secciones del panel"
    >
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            className="panel-nav-link"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
