import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/queries/public";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="contenido" className="site-main flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
