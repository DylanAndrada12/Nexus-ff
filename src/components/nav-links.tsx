"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/torneos", label: "Torneos" },
  { href: "/resultados", label: "Resultados" },
  { href: "/ranking", label: "Ranking" },
  { href: "/#contacto", label: "Contacto" },
];

export function NavLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center gap-7 ${className}`} aria-label="Principal">
      {links.map((link) => {
        const active =
          link.href !== "/#contacto" &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            className="nav-link"
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
