// Script de prueba para verificar la consistencia de métricas
import { getAllProductsStock, getCurrentStock, getInventoryValue } from './src/lib/inventory';

async function testConsistency() {
  console.log('🧪 Probando consistencia de métricas de inventario...\n');

  try {
    // Test 1: Verificar función centralizada
    console.log('📊 Test 1: Obteniendo stock de todos los productos');
    const { products, stockMap } = await getAllProductsStock();
    console.log(`✅ Productos encontrados: ${products.length}`);
    console.log(`✅ Stock calculado para: ${stockMap.size} productos`);

    // Test 2: Verificar consistencia entre funciones
    console.log('\n🔍 Test 2: Verificando consistencia entre funciones');
    let inconsistencies = 0;
    
    for (const product of products.slice(0, 5)) { // Solo primeros 5 para no saturar
      const stockFromMap = stockMap.get(product.id) ?? 0;
      const stockFromFunction = await getCurrentStock(product.id);
      
      if (stockFromMap !== stockFromFunction) {
        console.log(`❌ INCONSISTENCIA en ${product.sku}: Map=${stockFromMap}, Function=${stockFromFunction}`);
        inconsistencies++;
      } else {
        console.log(`✅ ${product.sku}: ${stockFromMap} (consistente)`);
      }
    }

    if (inconsistencies === 0) {
      console.log('\n🎉 ¡No se encontraron inconsistencias en el cálculo de stock!');
    } else {
      console.log(`\n⚠️  Se encontraron ${inconsistencies} inconsistencias`);
    }

    // Test 3: Inventario valorizado
    console.log('\n💰 Test 3: Calculando inventario valorizado');
    const inventoryValue = await getInventoryValue();
    console.log(`✅ Valor total del inventario: $${inventoryValue.toLocaleString()}`);

    console.log('\n✅ Pruebas completadas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testConsistency();
}

export { testConsistency };
