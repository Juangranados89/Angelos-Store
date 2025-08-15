import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

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
    const delta = g.type === "OUT" ? -v : v; // IN:+, OUT:-, ADJUST:+ (ajuste se registra como IN/OUT en el endpoint)
    stockMap.set(g.productId, prev + delta);
  }

  const rows = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    garmentType: p.garmentType ?? "",
    gender: p.gender ?? "",
    size: p.size ?? "",
    price: Number(p.price),
    stock: stockMap.get(p.id) ?? 0,
  }));

  return NextResponse.json(rows);
}
