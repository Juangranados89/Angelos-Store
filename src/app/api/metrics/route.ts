// src/app/api/metrics/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, MovementType } from "@prisma/client";

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

    const [products, grouped] = await Promise.all([
      prisma.product.findMany({ select: { id: true, costAverage: true } }),
      prisma.inventoryMovement.groupBy({
        by: ["productId", "type"],
        _sum: { qty: true },
      }),
    ]);

    type Grouped = {
      productId: string;
      type: MovementType;
      _sum: { qty: number | null };
    };
    const gData = grouped as Grouped[];

    const stockMap = new Map<string, number>();
    for (const g of gData) {
      const v = Number(g._sum.qty ?? 0);
      const prev = stockMap.get(g.productId) ?? 0;
      const delta = g.type === MovementType.OUT ? -v : v;
      stockMap.set(g.productId, prev + delta);
    }

    let inventarioValorizado = 0;
    for (const p of products as { id: string; costAverage: Prisma.Decimal }[]) {
      const stock = stockMap.get(p.id) ?? 0;
      inventarioValorizado += stock * Number(p.costAverage);
    }

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
