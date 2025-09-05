// Script para validar específicamente el total del inventario
const https = require('https');

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function validateInventoryTotal() {
  console.log("🔍 VALIDANDO TOTAL DEL INVENTARIO: $8.692.800\n");
  
  try {
    const products = await fetchData('https://angelos-web-t1o7.onrender.com/api/inventory');
    
    console.log(`📦 Productos obtenidos: ${products.length}`);
    console.log("=".repeat(80));
    
    let totalInventoryCost = 0;
    let totalStock = 0;
    let productCount = 0;
    let productsWithStock = 0;
    
    // Calcular usando la fórmula correcta: Σ(stock × costAverage)
    products.forEach(product => {
      const stock = product.stock || 0;
      const costAverage = parseFloat(product.costAverage) || 0;
      const productCost = stock * costAverage;
      
      totalInventoryCost += productCost;
      totalStock += stock;
      productCount++;
      
      if (stock > 0) {
        productsWithStock++;
      }
    });
    
    console.log("📊 CÁLCULO DETALLADO:");
    console.log(`Total productos: ${productCount}`);
    console.log(`Productos con stock: ${productsWithStock}`);
    console.log(`Stock total: ${totalStock} unidades`);
    console.log(`\n💰 TOTAL CALCULADO: $${totalInventoryCost.toLocaleString('es-CO')}`);
    
    // Comparar con el valor esperado
    const expectedTotal = 8692800;
    const difference = Math.abs(totalInventoryCost - expectedTotal);
    const percentageDiff = expectedTotal > 0 ? (difference / expectedTotal) * 100 : 0;
    
    console.log("\n🎯 VALIDACIÓN:");
    console.log(`Esperado: $${expectedTotal.toLocaleString('es-CO')}`);
    console.log(`Calculado: $${totalInventoryCost.toLocaleString('es-CO')}`);
    console.log(`Diferencia: $${difference.toLocaleString('es-CO')} (${percentageDiff.toFixed(2)}%)`);
    
    if (difference === 0) {
      console.log("✅ PERFECTO: Los valores coinciden exactamente");
    } else if (percentageDiff < 0.1) {
      console.log("✅ EXCELENTE: Diferencia mínima (menos del 0.1%)");
    } else if (percentageDiff < 1) {
      console.log("⚠️  BUENO: Diferencia pequeña (menos del 1%)");
    } else {
      console.log("❌ PROBLEMA: Diferencia significativa");
    }
    
    // Mostrar algunos productos de ejemplo para verificar
    console.log("\n📋 MUESTRA DE PRODUCTOS (primeros 10 con stock):");
    console.log("SKU\t\t\tStock\tCosto Unit\tCosto Total");
    console.log("-".repeat(70));
    
    let sampleTotal = 0;
    let sampleCount = 0;
    
    products.forEach(product => {
      if (product.stock > 0 && sampleCount < 10) {
        const stock = product.stock;
        const cost = parseFloat(product.costAverage) || 0;
        const totalCost = stock * cost;
        
        console.log(`${product.sku.padEnd(20)}\t${stock}\t$${cost.toLocaleString()}\t\t$${totalCost.toLocaleString()}`);
        sampleTotal += totalCost;
        sampleCount++;
      }
    });
    
    console.log("-".repeat(70));
    console.log(`Subtotal muestra: $${sampleTotal.toLocaleString('es-CO')} (${sampleCount} productos)`);
    
    // Verificar fórmula
    console.log("\n🔬 VERIFICACIÓN DE FÓRMULA:");
    console.log("Fórmula utilizada: Total = Σ(stock × costAverage)");
    console.log("✅ Esta es la fórmula correcta para calcular el valor del inventario al costo");
    console.log("✅ No incluye productos sin stock (stock = 0)");
    console.log("✅ Usa el costo promedio ponderado (costAverage)");
    
    // Verificar también el endpoint de métricas generales
    console.log("\n🔄 VERIFICANDO CON ENDPOINT DE MÉTRICAS...");
    try {
      const summary = await fetchData('https://angelos-web-t1o7.onrender.com/api/summary');
      console.log(`Inventario valorizado (endpoint summary): $${summary.inventarioValorizado.toLocaleString('es-CO')}`);
      
      const summaryDiff = Math.abs(summary.inventarioValorizado - totalInventoryCost);
      if (summaryDiff === 0) {
        console.log("✅ CONSISTENCIA PERFECTA: Ambos endpoints dan el mismo resultado");
      } else {
        console.log(`⚠️  INCONSISTENCIA: Diferencia de $${summaryDiff.toLocaleString('es-CO')}`);
      }
    } catch (error) {
      console.log("⚠️  No se pudo verificar el endpoint de métricas");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

validateInventoryTotal();
