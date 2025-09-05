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
  const { start, end } = monthRange();

  // Ingresos: suma de ventas del mes
  const salesAgg = await prisma.sale.aggregate({
    _sum: { total: true },
    where: { date: { gte: start, lt: end } },
  });
  const ingresos = Number(salesAgg._sum.total ?? 0);

  // Egresos: suma de gastos del mes
  const expensesAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: start, lt: end } },
  });
  const egresos = Number(expensesAgg._sum.amount ?? 0);

  // Usar la función centralizada para calcular inventario valorizado
  const inventarioValorizado = await getInventoryValue();
  
  const utilidad = ingresos - egresos;

  return NextResponse.json({
    ingresos,
    egresos,
    utilidad,
    inventarioValorizado,
    margen: ingresos ? utilidad / ingresos : 0,
  });
}
