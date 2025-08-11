import "./globals.css";
import React from "react";

export const metadata = {
  title: "ANGELOS Admin",
  description: "Administración e inventarios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b bg-white">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">ANGELOS — Admin</h1>
            <nav className="text-sm opacity-70">Inventario · Compras · Ventas · Caja · Reportes</nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
