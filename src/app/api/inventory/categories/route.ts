import { NextResponse } from "next/server";
import { getInventoryByCategory } from "@/lib/inventory";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categoryData = await getInventoryByCategory();
    return NextResponse.json(categoryData);
  } catch (error: any) {
    console.error("Error obteniendo métricas por categoría:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
