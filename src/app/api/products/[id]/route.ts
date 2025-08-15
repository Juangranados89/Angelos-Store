import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  if (data.price !== undefined) data.price = new Prisma.Decimal(data.price);

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      sku: data.sku,
      name: data.name,
      garmentType: data.garmentType,
      gender: data.gender,
      size: data.size,
      price: data.price,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se puede borrar (tiene movimientos)" }, { status: 409 });
  }
}
