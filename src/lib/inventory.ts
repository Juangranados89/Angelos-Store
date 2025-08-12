import { prisma } from "./prisma";
import { Prisma, MovementType } from "@prisma/client";

export async function getCurrentStock(productId: string) {
  const agg = (await prisma.inventoryMovement.groupBy({
    by: ["type"],
    where: { productId },
    _sum: { qty: true },
  })) as { type: MovementType; _sum: { qty: number | null } }[];

  const sum = (t: MovementType) => {
    const row = agg.find((a) => a.type === t);
    return Number(row?._sum.qty ?? 0);
    //            ^^^^^^^^^^^^^^^^^^^^^ evita NaN si es null/undefined
  };

  return sum(MovementType.IN) - sum(MovementType.OUT) + sum(MovementType.ADJUST);
}

export async function applyPurchase(productId: string, qty: number, unitCost: Prisma.Decimal) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Producto no encontrado");
  const stock = await getCurrentStock(productId);
  const current = new Prisma.Decimal(product.costAverage);
  const q = new Prisma.Decimal(qty);
  const newAvg =
    stock <= 0
      ? unitCost
      : current.mul(stock).add(unitCost.mul(q)).div(new Prisma.Decimal(stock).add(q));

  await prisma.product.update({ where: { id: productId }, data: { costAverage: newAvg } });
  await prisma.inventoryMovement.create({
    data: { productId, type: MovementType.IN, refType: "PURCHASE", refId: "auto", qty, unitCost },
  });
  return newAvg;
}

export async function applySale(productId: string, qty: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Producto no encontrado");
  await prisma.inventoryMovement.create({
    data: {
      productId,
      type: MovementType.OUT,
      refType: "SALE",
      refId: "auto",
      qty,
      unitCost: product.costAverage,
    },
  });
  return product.costAverage;
}
