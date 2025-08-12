import { NextResponse } from "next/server";
import { prisma, } from "@/lib/prisma";

function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

export async function GET() {
  const { start, end } = monthRange();

  // Ingresos: total de ventas del mes
  const salesAgg = await prisma.sale.aggregate({
    _sum: { total: true },
    where: { date: { gte: start, lt: end } },
  });
  const ingresos = Number(salesAgg._sum.total ?? 0);

  // COGS: sum(unitCost * qty) de items de ventas del mes
  const saleItems = await prisma.saleItem.findMany({
    where: { sale: { date: { gte: start, lt: end } } },
    select: { unitCost: true, qty: true },
  });
  const cogs = saleItems.reduce((s, it) => s + Number(it.unitCost) * it.qty, 0);

  // Egresos: gastos del mes (tabla Expense)
  const expensesAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: start, lt: end } },
  });
  const egresos = Number(expensesAgg._sum.amount ?? 0);

  const utilidad = ingresos - cogs - egresos;

  // Inventario valorizado: Σ (stock actual * costAverage)
  const [products, grouped] = await Promise.all([
    prisma.product.findMany({ select: { id: true, costAverage: true } }),
    prisma.inventoryMovement.groupBy({
      by: ["productId", "type"],
      _sum: { qty: true },
    }),
  ]);
  const stockMap = new Map<string, number>();
  for (const g of grouped) {
    const v = Number(g._sum.qty ?? 0);
    const prev = stockMap.get(g.productId) ?? 0;
    const delta = g.type === "IN" ? v : g.type === "OUT" ? -v : v;
    stockMap.set(g.productId, prev + delta);
  }
  const inventarioValorizado = products.reduce(
    (acc, p) => acc + (stockMap.get(p.id) ?? 0) * Number(p.costAverage),
    0
  );

  return NextResponse.json({
    ingresos,
    egresos,
    cogs,
    utilidad,
    inventarioValorizado,
    margen: ingresos ? (utilidad / ingresos) : 0,
  });
}
