import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { mark: 28, main: 17, tag: 8, tagline: 6.5 },
  md: { mark: 34, main: 21, tag: 9, tagline: 7 },
  lg: { mark: 44, main: 28, tag: 11, tagline: 8 },
};

export function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const values = sizes[size];
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 text-paper ${className}`}
      aria-label="NEXUS FF — Inicio"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logoNexus.png"
        alt="NEXUS FF"
        width={values.mark}
        height={values.mark}
        className="flex-none object-cover"
        style={{
          borderRadius: Math.max(4, values.mark * 0.16),
        }}
      />

      <span className="inline-flex min-w-0 flex-col">
        <span className="inline-flex items-baseline gap-1.5">
          <span
            className="display leading-none"
            style={{ fontSize: values.main, letterSpacing: "0.02em" }}
          >
            NEXUS
          </span>
          <span
            className="mono inline-flex items-center border border-flame/65 bg-flame/10 leading-none text-flame-soft"
            style={{
              fontSize: values.tag,
              padding: "3px 4px 2px",
              borderRadius: 2,
              letterSpacing: "0.08em",
            }}
          >
            FF
          </span>
        </span>
        {size === "lg" ? (
          <span
            className="mono mt-1 uppercase leading-none text-muted"
            style={{ fontSize: values.tagline, letterSpacing: "0.18em" }}
          >
            Competitive league
          </span>
        ) : null}
      </span>
    </Link>
  );
}
