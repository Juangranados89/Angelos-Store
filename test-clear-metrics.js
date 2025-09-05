// Script para probar las métricas claras de inversión
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

async function testClearMetrics() {
  console.log("🔍 PROBANDO MÉTRICAS CLARAS DE INVERSIÓN\n");
  
  try {
    // Probar el nuevo endpoint de investment
    console.log("📊 Probando endpoint /api/investment...");
    const investment = await fetchData('https://angelos-web-t1o7.onrender.com/api/investment');
    
    console.log("\n🎯 MÉTRICAS CLARAS:");
    console.log("=".repeat(70));
    
    console.log(`\n📈 HISTORIAL DE INVERSIÓN:`);
    console.log(`   Valor: $${investment.historialInversion?.toLocaleString('es-CO') || 'N/A'}`);
    console.log(`   Descripción: ${investment.descriptions?.historialInversion || 'N/A'}`);
    
    console.log(`\n📦 COSTO ACTUAL INVENTARIO:`);
    console.log(`   Valor: $${investment.costoActualInventario?.toLocaleString('es-CO') || 'N/A'}`);
    console.log(`   Descripción: ${investment.descriptions?.costoActualInventario || 'N/A'}`);
    
    console.log(`\n💰 VALOR VENDIDO:`);
    console.log(`   Valor: $${investment.valorVendido?.toLocaleString('es-CO') || 'N/A'}`);
    console.log(`   Descripción: ${investment.descriptions?.valorVendido || 'N/A'}`);
    
    console.log(`\n🔄 ROTACIÓN DE INVENTARIO:`);
    console.log(`   Valor: ${investment.rotacionInventario?.toFixed(1) || 'N/A'}%`);
    console.log(`   Descripción: ${investment.descriptions?.rotacionInventario || 'N/A'}`);
    
    console.log(`\n⚡ EFICIENCIA DE INVERSIÓN:`);
    console.log(`   Ratio: ${investment.eficienciaInversion?.toFixed(2) || 'N/A'}`);
    
    // Validar coherencia
    console.log("\n🔬 VALIDACIÓN DE COHERENCIA:");
    console.log("=".repeat(50));
    
    const historial = investment.historialInversion || 0;
    const actual = investment.costoActualInventario || 0;
    const vendido = investment.valorVendido || 0;
    
    const sumaCalculada = actual + vendido;
    const diferencia = Math.abs(historial - sumaCalculada);
    
    console.log(`Historial de Inversión: $${historial.toLocaleString('es-CO')}`);
    console.log(`Inventario Actual: $${actual.toLocaleString('es-CO')}`);
    console.log(`Valor Vendido: $${vendido.toLocaleString('es-CO')}`);
    console.log(`Suma (Actual + Vendido): $${sumaCalculada.toLocaleString('es-CO')}`);
    console.log(`Diferencia: $${diferencia.toLocaleString('es-CO')}`);
    
    if (diferencia <= 1000) {
      console.log("✅ COHERENCIA PERFECTA: Los números cuadran");
    } else if (diferencia <= 50000) {
      console.log("⚠️  COHERENCIA BUENA: Diferencia pequeña");
    } else {
      console.log("❌ INCOHERENCIA: Diferencia significativa");
    }
    
    // Comparar con tus capturas de pantalla
    console.log("\n📱 COMPARACIÓN CON TUS CAPTURAS:");
    console.log("=".repeat(50));
    
    const expectedCostoReal = 7204800;      // Primer captura
    const expectedCostoPromedio = 8695800;  // Segunda captura
    
    console.log(`\nCAPTURA 1 - "Costo Real": $${expectedCostoReal.toLocaleString('es-CO')}`);
    console.log(`CALCULADO - Historial Inversión: $${historial.toLocaleString('es-CO')}`);
    console.log(`Diferencia: $${Math.abs(historial - expectedCostoReal).toLocaleString('es-CO')}`);
    
    console.log(`\nCAPTURA 2 - "Costo Promedio": $${expectedCostoPromedio.toLocaleString('es-CO')}`);
    console.log(`CALCULADO - Costo Actual: $${actual.toLocaleString('es-CO')}`);
    console.log(`Diferencia: $${Math.abs(actual - expectedCostoPromedio).toLocaleString('es-CO')}`);
    
    // Análisis de las diferencias
    console.log("\n💡 ANÁLISIS:");
    console.log("=".repeat(40));
    
    if (historial > actual) {
      const porcentajeVendido = historial > 0 ? ((historial - actual) / historial) * 100 : 0;
      console.log(`✅ Has vendido ${porcentajeVendido.toFixed(1)}% de tu inversión histórica`);
      console.log(`✅ Te queda ${(100 - porcentajeVendido).toFixed(1)}% del inventario original`);
    } else {
      console.log("⚠️  El costo actual es mayor que la inversión histórica");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Fallback: calcular manualmente desde el inventario
    console.log("\n🔄 CALCULANDO MANUALMENTE DESDE INVENTARIO...");
    try {
      const products = await fetchData('https://angelos-web-t1o7.onrender.com/api/inventory');
      
      let costoActual = 0;
      let productosConStock = 0;
      
      products.forEach(product => {
        const stock = product.stock || 0;
        const cost = parseFloat(product.costAverage) || 0;
        costoActual += stock * cost;
        if (stock > 0) productosConStock++;
      });
      
      console.log(`\n📦 COSTO ACTUAL INVENTARIO (manual): $${costoActual.toLocaleString('es-CO')}`);
      console.log(`📊 Productos con stock: ${productosConStock}/${products.length}`);
      
    } catch (fallbackError) {
      console.error("❌ Error en fallback:", fallbackError.message);
    }
  }
}

testClearMetrics();
