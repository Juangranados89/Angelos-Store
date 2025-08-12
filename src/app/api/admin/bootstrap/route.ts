// src/app/api/admin/bootstrap/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

async function runSeed() {
  const email = process.env.INITIAL_ADMIN_EMAIL || "admin@angelos.local";
  const pass  = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
  const name  = process.env.INITIAL_ADMIN_NAME || "Administrador";

  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    const hash = await bcrypt.hash(pass, 10);
    admin = await prisma.user.create({
      data: { email, name, password: hash, role: "ADMIN" },
    });
  }

  const cat = await prisma.category.upsert({
    where: { name: "GENERAL" },
    update: {},
    create: { name: "GENERAL" },
  });

  const products = [
    { sku: "SKU-001", name: "Camisa Básica", garmentType: "Camisa", gender: "M", size: "M",  price: 50000, costAverage: 30000, ivaRate: 0.19 },
    { sku: "SKU-002", name: "Pantalón Slim", garmentType: "Pantalón", gender: "M", size: "32", price: 90000, costAverage: 60000, ivaRate: 0.19 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, categoryId: cat.id } as any,
    });
  }

  return { admin: admin.email, products: products.length };
}

async function handler(req: Request) {
  // Seguridad básica:
  // - Si existe SEED_TOKEN en env, exige ?token=... o header x-seed-token.
  // - Si NO existe SEED_TOKEN, solo permite si la BD está vacía (primera vez).
  const url   = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-seed-token") || "";
  const must  = process.env.SEED_TOKEN || "";

  const users = await prisma.user.count();
  const prods = await prisma.product.count();

  if (must) {
    if (token !== must) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else {
    if (users > 0 || prods > 0) {
      return NextResponse.json({ error: "already_seeded" }, { status: 409 });
    }
  }

  const out = await runSeed();
  return NextResponse.json({ ok: true, ...out });
}

export async function GET(req: Request)  { return handler(req); }
export async function POST(req: Request) { return handler(req); }
