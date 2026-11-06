"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Radio,
  Search,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/actions/auth";

type MobileUser = {
  name: string;
  role: string;
} | null;

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/torneos", label: "Torneos", icon: Trophy },
  { href: "/resultados", label: "Resultados", icon: Radio },
  { href: "/ranking", label: "Rankings", icon: BarChart3 },
  { href: "/#contacto", label: "Contacto", icon: Users },
];

export function MobileMenu({
  user,
  unread,
}: {
  user: MobileUser;
  unread: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className={`grid h-10 w-10 place-items-center rounded-md border transition-colors ${
          open
            ? "border-flame/50 bg-flame/10 text-white"
            : "border-line bg-white/[0.025] text-white"
        }`}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open ? (
        <div id="mobile-navigation" className="mobile-menu-panel">
          <div className="flex items-end justify-between border-b border-line pb-5">
            <Logo size="lg" />
            <span className="badge badge-flame">Menú</span>
          </div>

          <form action="/torneos" method="get" className="search-box mt-5" role="search">
            <Search size={15} className="shrink-0" aria-hidden="true" />
            <input
              type="search"
              name="q"
              placeholder="Buscar torneo…"
              aria-label="Buscar torneos"
            />
          </form>

          <nav className="mt-6" aria-label="Menú móvil">
            {links.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 border-b border-line py-4"
                >
                  <span className="mono w-5 text-[9px] text-flame/75">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-md border border-line bg-white/[0.025] text-muted transition-colors group-hover:border-flame/40 group-hover:text-flame-soft">
                    <Icon size={15} strokeWidth={1.8} />
                  </span>
                  <span className="display flex-1 text-2xl leading-none">{link.label}</span>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 space-y-3">
            {user ? (
              <>
                <div className="flex items-center justify-between gap-3 border border-line bg-white/[0.025] p-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="avatar">
                      {user.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{user.name}</p>
                      <p className="mono mt-0.5 text-[8px] uppercase tracking-[0.12em] text-flame-soft">
                        {user.role === "ADMIN" ? "Administrador" : "Capitán"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/panel/notificaciones"
                    onClick={() => setOpen(false)}
                    className="relative inline-flex items-center gap-2 text-muted hover:text-white"
                    aria-label={`Notificaciones${unread ? `: ${unread} sin leer` : ""}`}
                  >
                    <Bell size={16} />
                    {unread > 0 ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[9px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </Link>
                </div>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/panel"}
                  onClick={() => setOpen(false)}
                  className="btn btn-primary btn-block"
                >
                  <UserRound size={15} />
                  {user.role === "ADMIN" ? "Panel administrativo" : "Mi panel"}
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn btn-secondary btn-block">
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary btn-block"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="btn btn-primary btn-block"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          <p className="mono mt-8 text-center text-[8px] uppercase tracking-[0.16em] text-[#6f6368]">
            NEXUS FF · Free Fire Argentina
          </p>
        </div>
      ) : null}
    </div>
  );
}
