import "./globals.css";
import SidebarNav from "@/components/SidebarNav";

export const metadata = {
  title: "ANGELOS — Admin",
  description: "Administración & Contabilidad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="grid md:grid-cols-[260px_1fr]">
          <SidebarNav />
          <div>
            <header className="topbar">
              <div className="container py-3 flex items-center justify-between">
                <div className="brand">Administración <span className="dot">•</span> Contabilidad</div>
                <span className="badge">MVP</span>
              </div>
            </header>
            <main className="container py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
