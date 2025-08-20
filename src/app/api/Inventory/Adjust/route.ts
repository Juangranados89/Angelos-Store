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

  const type = delta > 0 ? MovementType.IN : MovementType.OUT;

  await prisma.inventoryMovement.create({
    data: {
      productId,
      type,
      refType: "ADJUST",
      refId: "manual",
      qty: Math.abs(delta),
      unitCost: new Prisma.Decimal(product.costAverage),
    },
  });

  return NextResponse.json({ ok: true });
}
