import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.product.create({ data });
  return NextResponse.json(created, { status: 201 });
}
