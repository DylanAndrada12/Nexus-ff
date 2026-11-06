import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import type { SiteSettings } from "@/lib/queries/public";

function whatsappHref(value: string): string {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    { label: "Instagram", href: settings.instagram_url },
    { label: "YouTube", href: settings.youtube_url },
    { label: "Twitch", href: settings.twitch_url },
    { label: "Discord", href: settings.discord_url },
  ].filter((social) => social.href);

  return (
    <footer className="site-footer">
      <div className="container-nexus py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <Logo size="lg" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Organización independiente de esports. Torneos de Free Fire
              competitivos, con inscripción por WhatsApp y resultados publicados.
            </p>
          </div>

          <div>
            <h2 className="mono mb-4 text-[9px] uppercase tracking-[0.14em] text-[#8c8085]">
              Competición
            </h2>
            <ul className="space-y-3 text-[13px]">
              <li>
                <Link href="/torneos" className="footer-link">
                  Torneos
                </Link>
              </li>
              <li>
                <Link href="/resultados" className="footer-link">
                  Resultados
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="footer-link">
                  Ranking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mono mb-4 text-[9px] uppercase tracking-[0.14em] text-[#8c8085]">
              Cuenta
            </h2>
            <ul className="space-y-3 text-[13px]">
              <li>
                <Link href="/registro" className="footer-link">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/panel" className="footer-link">
                  Panel del capitán
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mono mb-4 text-[9px] uppercase tracking-[0.14em] text-[#8c8085]">
              Contacto
            </h2>
            <ul className="space-y-3 text-[13px]">
              {settings.contact_email ? (
                <li>
                  <a href={`mailto:${settings.contact_email}`} className="footer-link">
                    {settings.contact_email}
                  </a>
                </li>
              ) : null}
              {settings.contact_whatsapp ? (
                <li>
                  <a
                    href={whatsappHref(settings.contact_whatsapp)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="footer-link"
                  >
                    WhatsApp {settings.contact_whatsapp}
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/#contacto" className="footer-link">
                  Formulario de soporte
                </Link>
              </li>
              {settings.support_hours ? (
                <li className="text-xs text-muted">{settings.support_hours}</li>
              ) : null}
            </ul>
            {socials.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono inline-flex items-center gap-1 text-[8.5px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-flame-soft"
                  >
                    {social.label}
                    <ArrowUpRight size={9} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="mono text-[9px] uppercase tracking-[0.08em] text-[#72666b]">
            © {new Date().getFullYear()} NEXUS FF. Todos los derechos reservados.
          </p>
          <p className="max-w-2xl text-[10.5px] leading-relaxed text-[#655a5f]">
            Free Fire es una marca registrada de Garena. NEXUS FF es una
            organización independiente y no está afiliada a Garena.
          </p>
        </div>
      </div>
    </footer>
  );
}
