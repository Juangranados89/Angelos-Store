const { PrismaClient } = require("@prisma/client");
const { getInventoryByCategory, getAllProductsStock } = require("./src/lib/inventory.ts");

const prisma = new PrismaClient();

async function testCategoryMetrics() {
  console.log("🧪 Probando métricas por categoría...\n");
  
  try {
    // 1. Obtener datos básicos
    const { products, stockMap } = await getAllProductsStock();
    console.log(`📦 Total productos: ${products.length}`);
    
    // 2. Mostrar productos por categoría manualmente
    const categoryMap = new Map();
    
    products.forEach(product => {
      const category = product.garmentType || "SIN CATEGORÍA";
      const stock = stockMap.get(product.id) || 0;
      const cost = Number(product.costAverage);
      const price = Number(product.price);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          products: [],
          totalStock: 0,
          totalCost: 0,
          totalValue: 0
        });
      }
      
      const cat = categoryMap.get(category);
      cat.products.push({
        sku: product.sku,
        name: product.name,
        stock,
        cost,
        price,
        totalCost: stock * cost,
        totalValue: stock * price
      });
      cat.totalStock += stock;
      cat.totalCost += stock * cost;
      cat.totalValue += stock * price;
    });
    
    // 3. Mostrar desglose por categoría
    console.log("\n📊 DESGLOSE POR CATEGORÍA:");
    console.log("=".repeat(80));
    
    for (const [category, data] of categoryMap) {
      console.log(`\n🏷️  ${category.toUpperCase()}`);
      console.log(`   📦 Productos: ${data.products.length}`);
      console.log(`   📈 Stock total: ${data.totalStock} unidades`);
      console.log(`   💰 Costo total: $${data.totalCost.toLocaleString()}`);
      console.log(`   🏪 Valor venta: $${data.totalValue.toLocaleString()}`);
      
      // Mostrar algunos productos como ejemplo
      console.log("   📋 Productos:");
      data.products.slice(0, 3).forEach(p => {
        console.log(`      ${p.sku}: ${p.stock} u × $${p.cost.toLocaleString()} = $${p.totalCost.toLocaleString()}`);
      });
      if (data.products.length > 3) {
        console.log(`      ... y ${data.products.length - 3} más`);
      }
    }
    
    // 4. Probar la función de la librería
    console.log("\n🔧 Probando función getInventoryByCategory()...");
    const categoryData = await getInventoryByCategory();
    
    console.log("\n📊 RESULTADO DE LA FUNCIÓN:");
    console.log("=".repeat(50));
    console.log(`Total costo inventario: $${categoryData.totalInventoryCost.toLocaleString()}`);
    
    categoryData.categories.forEach(cat => {
      console.log(`\n${cat.name}: ${cat.percentage.toFixed(1)}%`);
      console.log(`  Productos: ${cat.totalProducts}`);
      console.log(`  Stock: ${cat.totalStock} unidades`);
      console.log(`  Costo: $${cat.totalCost.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  testCategoryMetrics();
}

module.exports = { testCategoryMetrics };
