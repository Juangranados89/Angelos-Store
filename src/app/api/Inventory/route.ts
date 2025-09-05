// src/app/api/inventory/route.ts
import { NextResponse } from "next/server";
import { getAllProductsStock } from "@/lib/inventory";

export async function GET() {
  const { products, stockMap } = await getAllProductsStock();

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
