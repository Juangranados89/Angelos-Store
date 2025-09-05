import { NextResponse } from "next/server";
import { getAllProductsStock } from "@/lib/inventory";

export async function GET() {
  const { products, stockMap } = await getAllProductsStock();

  const rows = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    garmentType: p.garmentType ?? "",
    gender: p.gender ?? "",
    size: p.size ?? "",
    price: Number(p.price),
    costAverage: Number(p.costAverage), // Incluir costo promedio
    stock: stockMap.get(p.id) ?? 0,
  }));

  return NextResponse.json(rows);
}
