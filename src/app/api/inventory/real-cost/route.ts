import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllProductsStock } from "@/lib/inventory";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener todos los productos y su stock actual
    const { products, stockMap } = await getAllProductsStock();
    
    // Obtener todos los movimientos de inventario
    const movements = await prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        product: {
          select: {
            sku: true,
            name: true,
            garmentType: true
          }
        }
      }
    });
    
    // Calcular el costo real basado en movimientos
    const productRealCosts = new Map<string, {
      currentStock: number;
      totalCostBasis: number; // Suma de (qty × unitCost) para movimientos IN
      totalPurchasedQty: number; // Total de cantidades compradas
      averagePurchaseCost: number; // Costo promedio de compras
      realInventoryValue: number; // Stock actual × costo promedio de compras
    }>();
    
    // Inicializar productos
    products.forEach(product => {
      const currentStock = stockMap.get(product.id) || 0;
      productRealCosts.set(product.id, {
        currentStock,
        totalCostBasis: 0,
        totalPurchasedQty: 0,
        averagePurchaseCost: 0,
        realInventoryValue: 0
      });
    });
    
    // Procesar movimientos para calcular costo real
    movements.forEach(movement => {
      const productData = productRealCosts.get(movement.productId);
      if (!productData) return;
      
      if (movement.type === 'IN') {
        // Solo los movimientos IN (compras) contribuyen al costo real
        const unitCost = Number(movement.unitCost);
        productData.totalCostBasis += movement.qty * unitCost;
        productData.totalPurchasedQty += movement.qty;
      }
    });
    
    // Calcular costos promedio y valores finales
    let totalRealInventoryValue = 0;
    let totalCostAverageValue = 0;
    
    for (const [productId, data] of productRealCosts) {
      // Calcular costo promedio de compras
      if (data.totalPurchasedQty > 0) {
        data.averagePurchaseCost = data.totalCostBasis / data.totalPurchasedQty;
      }
      
      // Valor del inventario actual usando costo real de compras
      data.realInventoryValue = data.currentStock * data.averagePurchaseCost;
      totalRealInventoryValue += data.realInventoryValue;
      
      // Para comparar: valor usando costAverage del producto
      const product = products.find(p => p.id === productId);
      if (product) {
        totalCostAverageValue += data.currentStock * Number(product.costAverage);
      }
    }
    
    // Preparar respuesta con análisis detallado
    const analysis = {
      summary: {
        totalProducts: products.length,
        productsWithStock: stockMap.size,
        totalStock: Array.from(stockMap.values()).reduce((sum, stock) => sum + stock, 0),
        realInventoryValue: totalRealInventoryValue,
        costAverageValue: totalCostAverageValue,
        difference: totalRealInventoryValue - totalCostAverageValue
      },
      movements: {
        total: movements.length,
        inMovements: movements.filter(m => m.type === 'IN').length,
        outMovements: movements.filter(m => m.type === 'OUT').length,
        adjustMovements: movements.filter(m => m.type === 'ADJUST').length
      },
      topProducts: Array.from(productRealCosts.entries())
        .map(([productId, data]) => {
          const product = products.find(p => p.id === productId);
          return {
            productId,
            sku: product?.sku || 'N/A',
            name: product?.name || 'N/A',
            garmentType: product?.garmentType || 'N/A',
            currentStock: data.currentStock,
            costAverage: Number(product?.costAverage || 0),
            realAverageCost: data.averagePurchaseCost,
            costDifference: data.averagePurchaseCost - Number(product?.costAverage || 0),
            realInventoryValue: data.realInventoryValue,
            costAverageInventoryValue: data.currentStock * Number(product?.costAverage || 0),
            valueDifference: data.realInventoryValue - (data.currentStock * Number(product?.costAverage || 0))
          };
        })
        .filter(item => item.currentStock > 0)
        .sort((a, b) => Math.abs(b.valueDifference) - Math.abs(a.valueDifference))
        .slice(0, 20)
    };
    
    return NextResponse.json(analysis);
    
  } catch (error: any) {
    console.error("Error calculando costo real:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
