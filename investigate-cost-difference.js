// Script para investigar la diferencia entre "Costo real" vs "Costo promedio" del inventario
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

async function investigateCostDifference() {
  console.log("🔍 INVESTIGANDO DIFERENCIA: COSTO REAL vs COSTO PROMEDIO\n");
  console.log("Captura 1 (Métricas): $7.204.800 - 'Inversión real en inventario'");
  console.log("Captura 2 (Inventario): $8.695.800 - 'Costo promedio del inventario'");
  console.log("Diferencia: $1.491.000");
  console.log("=".repeat(80));
  
  try {
    // Obtener datos de productos
    const products = await fetchData('https://angelos-web-t1o7.onrender.com/api/inventory');
    console.log(`\n📦 Productos obtenidos: ${products.length}`);
    
    // Obtener métricas de summary
    let summaryMetrics = null;
    try {
      summaryMetrics = await fetchData('https://angelos-web-t1o7.onrender.com/api/summary');
      console.log(`📊 Métricas del summary obtenidas`);
    } catch (e) {
      console.log(`⚠️  No se pudieron obtener métricas del summary: ${e.message}`);
    }
    
    // CÁLCULO 1: Usando costAverage (lo que actualmente usa la aplicación)
    let totalCostAverage = 0;
    let totalStock = 0;
    let productsWithStock = 0;
    
    products.forEach(product => {
      const stock = product.stock || 0;
      const costAverage = parseFloat(product.costAverage) || 0;
      
      if (stock > 0) {
        totalCostAverage += stock * costAverage;
        productsWithStock++;
      }
      totalStock += stock;
    });
    
    console.log("\n💰 MÉTODO 1: COSTO PROMEDIO (costAverage)");
    console.log(`Fórmula: Σ(stock × costAverage)`);
    console.log(`Resultado: $${totalCostAverage.toLocaleString('es-CO')}`);
    console.log(`Productos con stock: ${productsWithStock}/${products.length}`);
    
    // CÁLCULO 2: Buscar si hay algún campo de "costo real" o "costo de compra"
    console.log("\n🔍 BUSCANDO OTROS CAMPOS DE COSTO...");
    
    // Analizar la estructura de los primeros productos
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log("📋 Campos disponibles en productos:");
      Object.keys(sampleProduct).forEach(key => {
        if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('precio') || key.toLowerCase().includes('price')) {
          console.log(`  - ${key}: ${sampleProduct[key]}`);
        }
      });
    }
    
    // CÁLCULO 3: Analizar movimientos de inventario para obtener costos reales
    console.log("\n🔄 ANALIZANDO MOVIMIENTOS DE INVENTARIO...");
    
    // Este sería el cálculo más preciso: usando los costos reales de las compras
    let realCostFromMovements = 0;
    let productCostAnalysis = new Map();
    
    // Simulamos el análisis de movimientos (necesitaríamos endpoint de movimientos)
    console.log("⚠️  Para calcular el 'costo real' necesitaríamos acceso a los movimientos de inventario");
    console.log("   El 'costo real' sería: Σ(cantidad_actual × costo_promedio_ponderado_de_compras)");
    
    // Comparar con las métricas del summary si están disponibles
    if (summaryMetrics) {
      console.log("\n📊 COMPARACIÓN CON ENDPOINT SUMMARY:");
      console.log(`Summary inventarioValorizado: $${summaryMetrics.inventarioValorizado.toLocaleString('es-CO')}`);
      console.log(`Cálculo directo: $${totalCostAverage.toLocaleString('es-CO')}`);
      
      const diff = Math.abs(summaryMetrics.inventarioValorizado - totalCostAverage);
      console.log(`Diferencia: $${diff.toLocaleString('es-CO')}`);
      
      if (diff === 0) {
        console.log("✅ Consistencia perfecta entre endpoints");
      } else {
        console.log("⚠️  Hay inconsistencia entre endpoints");
      }
    }
    
    // Análisis de la diferencia observada
    console.log("\n🎯 ANÁLISIS DE LA DIFERENCIA OBSERVADA:");
    console.log(`Valor actual calculado: $${totalCostAverage.toLocaleString('es-CO')}`);
    console.log(`Valor en Captura 1: $7.204.800`);
    console.log(`Valor en Captura 2: $8.695.800`);
    
    const diff1 = Math.abs(totalCostAverage - 7204800);
    const diff2 = Math.abs(totalCostAverage - 8695800);
    
    console.log(`Diferencia con Captura 1: $${diff1.toLocaleString('es-CO')}`);
    console.log(`Diferencia con Captura 2: $${diff2.toLocaleString('es-CO')}`);
    
    if (diff1 < diff2) {
      console.log("✅ El valor actual se acerca más a la Captura 1 (Métricas)");
    } else {
      console.log("✅ El valor actual se acerca más a la Captura 2 (Inventario)");
    }
    
    // Posibles explicaciones
    console.log("\n💡 POSIBLES EXPLICACIONES DE LA DIFERENCIA:");
    console.log("1. 'Costo real' = Costo basado en compras reales históricas");
    console.log("2. 'Costo promedio' = Campo costAverage que puede no reflejar compras reales");
    console.log("3. Movimientos de inventario que afectaron los costos");
    console.log("4. Ajustes manuales de precios/costos");
    console.log("5. Diferencias temporales entre capturas");
    
    console.log("\n🔧 RECOMENDACIÓN:");
    console.log("Para obtener el 'costo real', necesitamos:");
    console.log("1. Acceso a la tabla InventoryMovement");
    console.log("2. Calcular el costo ponderado basado en compras (IN movements)");
    console.log("3. Verificar si hay ajustes de costos que no se reflejen en costAverage");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

investigateCostDifference();
