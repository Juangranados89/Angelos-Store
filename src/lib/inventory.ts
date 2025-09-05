import { prisma } from "./prisma";
import { Prisma, MovementType } from "@prisma/client";

export async function getCurrentStock(productId: string) {
  const movements = await prisma.inventoryMovement.findMany({
    where: { productId },
    select: { type: true, qty: true },
  });

  let stock = 0;
  for (const movement of movements) {
    switch (movement.type) {
      case MovementType.IN:
        stock += movement.qty;
        break;
      case MovementType.OUT:
        stock -= movement.qty;
        break;
      case MovementType.ADJUST:
        // Los ajustes pueden ser positivos o negativos
        stock += movement.qty;
        break;
    }
  }

  return stock;
}

// Función centralizada para calcular stock de todos los productos
export async function getAllProductsStock() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.inventoryMovement.findMany({
      select: { productId: true, type: true, qty: true },
    }),
  ]);

  const stockMap = new Map<string, number>();
  
  for (const movement of movements) {
    const currentStock = stockMap.get(movement.productId) ?? 0;
    
    let delta = 0;
    switch (movement.type) {
      case MovementType.IN:
        delta = movement.qty;
        break;
      case MovementType.OUT:
        delta = -movement.qty;
        break;
      case MovementType.ADJUST:
        // Los ajustes pueden ser positivos o negativos
        delta = movement.qty;
        break;
    }
    
    stockMap.set(movement.productId, currentStock + delta);
  }

  return { products, stockMap };
}

// Función para calcular inventario valorizado
export async function getInventoryValue() {
  const { products, stockMap } = await getAllProductsStock();
  
  let totalValue = 0;
  for (const product of products) {
    const stock = stockMap.get(product.id) ?? 0;
    const cost = Number(product.costAverage);
    totalValue += stock * cost;
  }
  
  return totalValue;
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
