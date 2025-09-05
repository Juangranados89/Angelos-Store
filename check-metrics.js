const { getAllProductsStock, getInventoryValue } = require('./src/lib/inventory');

async function checkMetrics() {
  console.log('🔍 Verificando métricas de inventario...\n');
  
  try {
    // 1. Obtener stock de todos los productos
    const { products, stockMap } = await getAllProductsStock();
    
    console.log(`📦 Total de productos: ${products.length}`);
    console.log(`📦 Productos con stock: ${stockMap.size}\n`);
    
    // 2. Calcular inventario valorizado
    const inventoryValue = await getInventoryValue();
    console.log(`💰 Valor del inventario: $${inventoryValue.toLocaleString()}`);
    
    // 3. Mostrar algunos productos con su stock y valor
    let totalValueCheck = 0;
    let productCount = 0;
    
    console.log('\n📋 Detalle de productos (primeros 10):');
    console.log('SKU\t\tStock\tCosto Prom\tValor Total');
    console.log('-'.repeat(60));
    
    for (const product of products.slice(0, 10)) {
      const stock = stockMap.get(product.id) ?? 0;
      const cost = Number(product.costAverage);
      const value = stock * cost;
      totalValueCheck += value;
      productCount++;
      
      console.log(`${product.sku}\t\t${stock}\t$${cost.toLocaleString()}\t\t$${value.toLocaleString()}`);
    }
    
    console.log('-'.repeat(60));
    console.log(`Subtotal (${productCount} productos): $${totalValueCheck.toLocaleString()}`);
    console.log(`Total inventario: $${inventoryValue.toLocaleString()}`);
    
    // 4. Calcular diferencia con el valor mostrado en dashboard
    const dashboardValue = 8692800; // Valor del dashboard
    const difference = dashboardValue - inventoryValue;
    
    console.log(`\n⚖️  COMPARACIÓN:`);
    console.log(`Dashboard muestra: $${dashboardValue.toLocaleString()}`);
    console.log(`Cálculo real: $${inventoryValue.toLocaleString()}`);
    console.log(`Diferencia: $${difference.toLocaleString()}`);
    
    if (Math.abs(difference) > 1000) {
      console.log('❌ INCONSISTENCIA DETECTADA - Diferencia significativa');
    } else {
      console.log('✅ VALORES CONSISTENTES');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMetrics();
