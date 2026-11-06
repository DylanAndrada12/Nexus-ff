import Link from "next/link";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function AdminPagination({ page, totalPages, buildHref }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page - 1;
  const next = page + 1;

  // Páginas visibles: siempre primera, última, actual y sus vecinas
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
    pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Paginación">
      <p className="mono text-[11px] text-muted">
        Página {page} de {totalPages}
      </p>
      <div className="flex flex-wrap gap-1">
        {page > 1 && (
          <Link href={buildHref(prev)} className="border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-flame/50 hover:text-white">
            ← Anterior
          </Link>
        )}
        {sorted.map((p, i) => {
          const prevP = sorted[i - 1];
          const showEllipsis = prevP !== undefined && p - prevP > 1;
          return (
            <span key={p} className="flex gap-1">
              {showEllipsis && (
                <span className="border border-line px-3 py-1.5 text-xs text-[#444]">…</span>
              )}
              <Link
                href={buildHref(p)}
                aria-current={p === page ? "page" : undefined}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  p === page
                    ? "border-flame/70 bg-flame text-white shadow-[0_6px_18px_rgba(190,25,40,0.22)]"
                    : "border-line text-muted hover:border-flame/45 hover:text-white"
                }`}
              >
                {p}
              </Link>
            </span>
          );
        })}
        {page < totalPages && (
          <Link href={buildHref(next)} className="border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-flame/50 hover:text-white">
            Siguiente →
          </Link>
        )}
      </div>
    </nav>
  );
}

export function parsePage(raw: string | undefined, defaultPage = 1): number {
  const n = Number(raw ?? defaultPage);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : defaultPage;
}
