import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.sku || !body?.name) {
    return NextResponse.json({ error: "sku y name son requeridos" }, { status: 400 });
  }

  const created = await prisma.product.create({
    data: {
      sku: body.sku,
      name: body.name,
      garmentType: body.garmentType ?? null,
      gender: body.gender ?? null,
      size: body.size ?? null,
      price: new Prisma.Decimal(body.price ?? 0),
      costAverage: new Prisma.Decimal(body.costAverage ?? body.price ?? 0),
      ivaRate: new Prisma.Decimal(body.ivaRate ?? 0.19),
      categoryId: body.categoryId ?? null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
