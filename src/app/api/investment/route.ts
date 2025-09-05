import { NextResponse } from "next/server";
import { getInvestmentMetrics } from "@/lib/inventory";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getInvestmentMetrics();
    
    return NextResponse.json({
      // Métricas principales con nombres claros
      historialInversion: metrics.totalInvestment,           // Todo el dinero invertido
      costoActualInventario: metrics.currentInventoryValue,  // Valor actual del stock
      valorVendido: metrics.soldInventoryValue,              // Valor del inventario vendido
      
      // Métricas adicionales
      rotacionInventario: metrics.inventoryTurnover,         // % de rotación
      eficienciaInversion: metrics.investmentEfficiency,     // Ratio de eficiencia
      
      // Descripciiones para claridad
      descriptions: {
        historialInversion: "Todo el dinero que has invertido en compras históricamente",
        costoActualInventario: "Valor actual de tu stock (cantidad × costo promedio)",
        valorVendido: "Valor del inventario que ya se ha vendido",
        rotacionInventario: "Porcentaje del inventario que se ha vendido",
        eficienciaInversion: "Ratio de inversión total vs inventario actual"
      }
    });
  } catch (error: any) {
    console.error("Error obteniendo métricas de inversión:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
