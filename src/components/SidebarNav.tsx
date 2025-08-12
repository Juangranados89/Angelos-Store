"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Boxes, ShoppingCart, BadgeDollarSign, Wallet, BookOpenCheck,
  BarChart3, Settings, Feather
} from "lucide-react";

const items = [
  { label: "Panel", href: "/", icon: User },
  { label: "Inventario", href: "/products", icon: Boxes },
  { label: "Compras", href: "/purchases/new", icon: ShoppingCart },
  { label: "Ventas", href: "/sales/new", icon: BadgeDollarSign },
  { label: "Caja y Bancos", href: "#", icon: Wallet },
  { label: "Contabilidad", href: "#", icon: BookOpenCheck },
  { label: "Reportes", href: "/reports/kardex", icon: BarChart3 },
  { label: "Configuración", href: "#", icon: Settings },
];

export default function SidebarNav() {
  const path = usePathname();

  return (
    <aside className="sidebar min-h-screen p-4">
      {/* Brand */}
      <div className="px-2 py-3 mb-4 flex items-center gap-2 text-[18px] font-semibold">
        <Feather size={22} strokeWidth={2.2} color="#d4b36b" />
        <span style={{ color: "#d4b36b", letterSpacing: ".5px" }}>ANGELOS</span>
      </div>

      <nav className="space-y-2">
        {items.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="block">
              <span
                className={
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition " +
                  (active
                    ? "bg-gradient-to-b from-[#e9c988] to-[#d4b36b] text-black"
                    : "hover:bg-white/5 text-[#e4e5e7]")
                }
              >
                <Icon size={18} color={active ? "#111" : "#d4b36b"} />
                <span>{label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
