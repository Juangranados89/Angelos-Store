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

// Función para calcular inventario valorizado (COSTO ACTUAL INVENTARIO)
// Valor del stock actual usando costo promedio ponderado
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

// Función para calcular HISTORIAL DE INVERSIÓN
// Todo el dinero que se ha invertido en compras históricamente
export async function getTotalInvestmentHistory() {
  const purchases = await prisma.inventoryMovement.findMany({
    where: {
      type: MovementType.IN,
      refType: "PURCHASE"
    },
    select: {
      qty: true,
      unitCost: true
    }
  });

  let totalInvestment = 0;
  for (const purchase of purchases) {
    const cost = Number(purchase.unitCost);
    totalInvestment += purchase.qty * cost;
  }

  return totalInvestment;
}

// Función para obtener métricas de inversión detalladas
export async function getInvestmentMetrics() {
  const [currentInventoryValue, totalInvestment] = await Promise.all([
    getInventoryValue(),
    getTotalInvestmentHistory()
  ]);

  const soldInventoryValue = totalInvestment - currentInventoryValue;
  const inventoryTurnover = totalInvestment > 0 ? (soldInventoryValue / totalInvestment) * 100 : 0;

  return {
    // Métricas principales
    totalInvestment,           // Todo el dinero invertido
    currentInventoryValue,     // Valor actual del stock
    soldInventoryValue,        // Valor del inventario vendido
    inventoryTurnover,         // Rotación de inventario (%)
    
    // Información adicional
    investmentEfficiency: currentInventoryValue > 0 ? totalInvestment / currentInventoryValue : 0
  };
}

// Función para calcular métricas por categoría
export async function getInventoryByCategory() {
  const { products, stockMap } = await getAllProductsStock();
  
  const categoryStats = new Map<string, {
    totalProducts: number;
    totalStock: number;
    totalCost: number;
    totalValue: number; // Valor al precio de venta
    percentage: number; // Se calculará después
  }>();
  
  let totalInventoryCost = 0;
  
  // Agrupar por categoría (garmentType)
  for (const product of products) {
    const stock = stockMap.get(product.id) ?? 0;
    const cost = Number(product.costAverage);
    const price = Number(product.price);
    const category = product.garmentType || "SIN CATEGORÍA";
    
    const productCost = stock * cost;
    const productValue = stock * price;
    
    if (!categoryStats.has(category)) {
      categoryStats.set(category, {
        totalProducts: 0,
        totalStock: 0,
        totalCost: 0,
        totalValue: 0,
        percentage: 0
      });
    }
    
    const stats = categoryStats.get(category)!;
    stats.totalProducts += 1;
    stats.totalStock += stock;
    stats.totalCost += productCost;
    stats.totalValue += productValue;
    
    totalInventoryCost += productCost;
  }
  
  // Calcular porcentajes
  for (const [category, stats] of categoryStats) {
    stats.percentage = totalInventoryCost > 0 ? (stats.totalCost / totalInventoryCost) * 100 : 0;
  }
  
  return {
    categories: Array.from(categoryStats.entries()).map(([category, stats]) => ({
      name: category,
      ...stats
    })),
    totalInventoryCost
  };
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
