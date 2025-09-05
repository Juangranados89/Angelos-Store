// Script para analizar los datos reales de Render y verificar cálculos
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

async function analyzeRealData() {
  console.log("🔍 ANALIZANDO DATOS REALES DE RENDER\n");
  
  try {
    const products = await fetchData('https://angelos-web-t1o7.onrender.com/api/inventory');
    
    console.log(`📦 Total productos obtenidos: ${products.length}\n`);
    
    // Agrupar por categoría
    const categories = new Map();
    let totalInventoryCost = 0;
    let totalStock = 0;
    
    products.forEach(product => {
      const category = product.garmentType || 'SIN CATEGORÍA';
      const stock = product.stock || 0;
      const cost = parseFloat(product.costAverage) || 0;
      const price = parseFloat(product.price) || 0;
      
      const productCost = stock * cost;
      const productValue = stock * price;
      
      if (!categories.has(category)) {
        categories.set(category, {
          totalProducts: 0,
          totalStock: 0,
          totalCost: 0,
          totalValue: 0,
          products: []
        });
      }
      
      const cat = categories.get(category);
      cat.totalProducts += 1;
      cat.totalStock += stock;
      cat.totalCost += productCost;
      cat.totalValue += productValue;
      cat.products.push({
        sku: product.sku,
        name: product.name,
        stock,
        cost,
        price,
        totalCost: productCost
      });
      
      totalInventoryCost += productCost;
      totalStock += stock;
    });
    
    console.log("📊 RESUMEN GENERAL:");
    console.log(`Total productos: ${products.length}`);
    console.log(`Total stock: ${totalStock} unidades`);
    console.log(`Total costo inventario: $${totalInventoryCost.toLocaleString('es-CO')}`);
    console.log("\n" + "=".repeat(80));
    
    // Mostrar por categorías
    const sortedCategories = Array.from(categories.entries())
      .sort((a, b) => b[1].totalCost - a[1].totalCost);
    
    console.log("\n🏷️  DISTRIBUCIÓN POR CATEGORÍAS (CÁLCULOS CORRECTOS):");
    console.log("=".repeat(80));
    
    sortedCategories.forEach(([category, data]) => {
      const percentage = totalInventoryCost > 0 ? (data.totalCost / totalInventoryCost) * 100 : 0;
      
      console.log(`\n${category}: ${percentage.toFixed(1)}%`);
      console.log(`  📦 ${data.totalProducts} productos`);
      console.log(`  📈 Stock: ${data.totalStock} unidades`);
      console.log(`  💰 Costo: $${data.totalCost.toLocaleString('es-CO')}`);
      console.log(`  🏪 Valor venta: $${data.totalValue.toLocaleString('es-CO')}`);
      
      // Mostrar los primeros 3 productos como ejemplo
      console.log("     Ejemplos:");
      data.products.slice(0, 3).forEach(p => {
        console.log(`     - ${p.sku}: ${p.stock} u × $${p.cost.toLocaleString()} = $${p.totalCost.toLocaleString()}`);
      });
      
      if (data.products.length > 3) {
        console.log(`     ... y ${data.products.length - 3} productos más`);
      }
    });
    
    console.log("\n🎯 COMPARACIÓN CON TU CAPTURA:");
    console.log("=".repeat(50));
    
    const expectedFromCapture = {
      'BODY': { percentage: 12, cost: 1427000 },
      'BASICA': { percentage: 8, cost: 881200 },
      'SKINNY': { percentage: 8, cost: 874800 },
      'SHORT': { percentage: 7, cost: 850000 },
      'CORSET': { percentage: 5, cost: 624000 },
      'BOTA RECTA': { percentage: 5, cost: 620000 }
    };
    
    sortedCategories.forEach(([category, data]) => {
      const realPercentage = totalInventoryCost > 0 ? (data.totalCost / totalInventoryCost) * 100 : 0;
      const expected = expectedFromCapture[category];
      
      if (expected) {
        const percentageDiff = Math.abs(realPercentage - expected.percentage);
        const costDiff = Math.abs(data.totalCost - expected.cost);
        
        console.log(`\n${category}:`);
        console.log(`  Real: ${realPercentage.toFixed(1)}% ($${data.totalCost.toLocaleString()})`);
        console.log(`  Captura: ${expected.percentage}% ($${expected.cost.toLocaleString()})`);
        console.log(`  Diferencias: ${percentageDiff.toFixed(1)}% | $${costDiff.toLocaleString()}`);
        console.log(`  ${percentageDiff <= 1 && costDiff <= 50000 ? '✅ COINCIDE' : '❌ DIFERENCIA SIGNIFICATIVA'}`);
      } else {
        console.log(`\n${category}: ${realPercentage.toFixed(1)}% (No estaba en tu captura)`);
      }
    });
    
    console.log("\n💡 CONCLUSIÓN:");
    console.log("Los cálculos ahora están basados en datos reales de tu base de datos.");
    console.log("Si hay diferencias, significa que los datos han cambiado desde tu captura");
    console.log("o que había errores en los cálculos anteriores.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

analyzeRealData();
