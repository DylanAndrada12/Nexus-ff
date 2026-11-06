"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, LogIn, Trophy, User, UserPlus } from "lucide-react";

type MobileUser = { name: string; role: string } | null;

export function MobileBottomNav({
  user,
  unread,
}: {
  user: MobileUser;
  unread: number;
}) {
  const pathname = usePathname();

  const items = user
    ? [
        { href: "/torneos", label: "Torneos", icon: Trophy },
        { href: "/ranking", label: "Rankings", icon: BarChart3 },
        {
          href: "/panel/notificaciones",
          label: "Avisos",
          icon: Bell,
          badge: unread,
        },
        { href: "/panel/perfil", label: "Perfil", icon: User },
      ]
    : [
        { href: "/torneos", label: "Torneos", icon: Trophy },
        { href: "/ranking", label: "Rankings", icon: BarChart3 },
        { href: "/login", label: "Ingresar", icon: LogIn },
        { href: "/registro", label: "Cuenta", icon: UserPlus },
      ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación rápida">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/panel/notificaciones"
            ? pathname.startsWith("/panel/notificaciones")
            : item.href === "/panel/perfil"
              ? pathname.startsWith("/panel/perfil")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            className="mobile-bottom-link"
          >
            <span className="relative">
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -right-2 -top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-flame px-1 text-[7px] font-bold leading-none text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
