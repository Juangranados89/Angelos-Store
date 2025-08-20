// src/app/api/inventory/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [products, grouped] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.inventoryMovement.groupBy({
      by: ["productId", "type"],
      _sum: { qty: true },
    }),
  ]);

  const stockMap = new Map<string, number>();
  for (const g of grouped) {
    const v = Number(g._sum.qty ?? 0);
    const prev = stockMap.get(g.productId) ?? 0;
    const delta = g.type === "OUT" ? -v : v; // IN:+, OUT:-, ADJUST:+
    stockMap.set(g.productId, prev + delta);
  }

  const rows = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    garmentType: (p as any).garmentType ?? "",
    gender: (p as any).gender ?? "",
    size: (p as any).size ?? "",
    price: Number(p.price),
    stock: stockMap.get(p.id) ?? 0,
  }));

  return NextResponse.json(rows);
}
