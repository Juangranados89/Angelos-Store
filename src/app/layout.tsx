import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ANGELOS — Admin",
  description: "Administración & Contabilidad",
};

const Nav = () => (
  <nav className="space-y-1">
    {[
      ["Panel","/"],
      ["Inventario","/products"],
      ["Compras","/purchases/new"],
      ["Ventas","/sales/new"],
      ["Caja y Bancos","#"],
      ["Contabilidad","#"],
      ["Reportes","/reports/kardex"],
      ["Configuración","#"],
    ].map(([label,href])=>(
      <Link key={label} href={href} className="block">
        <span className="inline-flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5">
          <span className="w-2 h-2 rounded-full" style={{background:"var(--accent)"}}/>
          {label}
        </span>
      </Link>
    ))}
  </nav>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="grid md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="sidebar min-h-screen p-4">
            <div className="px-2 py-3 mb-4 text-lg font-semibold">
              <span>ANGELOS</span>
            </div>
            <Nav />
          </aside>

          {/* Main */}
          <div>
            <header className="topbar">
              <div className="container py-3 flex items-center justify-between">
                <div className="brand">Administración <span className="dot">•</span> Contabilidad</div>
                <div className="flex items-center gap-2">
                  <span className="badge">MVP</span>
                </div>
              </div>
            </header>
            <main className="container py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
