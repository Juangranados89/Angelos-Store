// src/app/api/metrics/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getInventoryValue } from "@/lib/inventory";

// Marcar como dinámico para evitar pre-renderizado estático
export const dynamic = 'force-dynamic';

function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

export async function GET() {
  try {
    const { start, end } = monthRange();

    const salesAgg = await prisma.sale.aggregate({
      _sum: { total: true },
      where: { date: { gte: start, lt: end } },
    });
    const ingresos = Number(salesAgg._sum.total ?? 0);

    const saleItems = await prisma.saleItem.findMany({
      where: { sale: { date: { gte: start, lt: end } } },
      select: { unitCost: true, qty: true },
    });
    type SaleItemAgg = { unitCost: Prisma.Decimal; qty: number };
    const cogs = saleItems.reduce(
      (sum: number, it: SaleItemAgg) => sum + Number(it.unitCost) * it.qty,
      0
    );

    const expensesAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: start, lt: end } },
    });
    const egresos = Number(expensesAgg._sum.amount ?? 0);

    const utilidad = ingresos - cogs - egresos;

    // Usar la función centralizada para calcular inventario valorizado
    const inventarioValorizado = await getInventoryValue();

    return NextResponse.json({
      ingresos,
      egresos,
      cogs,
      utilidad,
      inventarioValorizado,
      margen: ingresos ? utilidad / ingresos : 0,
    });
  } catch (e: any) {
    console.error("metrics error:", e?.message || e);
    return NextResponse.json({ error: "metrics_failed" }, { status: 500 });
  }
}
