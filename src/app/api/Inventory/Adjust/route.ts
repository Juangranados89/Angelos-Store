import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MovementType, Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const { productId, delta } = await req.json(); // delta puede ser + o -
  if (!productId || typeof delta !== "number" || delta === 0) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Producto no existe" }, { status: 404 });

  // Usar MovementType.ADJUST con la cantidad real (positiva o negativa)
  await prisma.inventoryMovement.create({
    data: {
      productId,
      type: MovementType.ADJUST,
      refType: "ADJUST",
      refId: "manual",
      qty: delta, // Mantener el signo del delta
      unitCost: new Prisma.Decimal(product.costAverage),
    },
  });

  return NextResponse.json({ ok: true });
}
