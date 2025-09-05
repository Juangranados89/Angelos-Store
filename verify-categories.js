// Script para simular y verificar los cálculos de métricas por categoría
console.log("🧪 SIMULANDO MÉTRICAS POR CATEGORÍA\n");

// Datos de ejemplo basados en tu captura de pantalla
const productosMockup = [
  // BODY (12%) - 18 productos, 21 unidades, $1.427.000
  { categoria: "BODY", productos: 18, stock: 21, costoTotal: 1427000 },
  
  // BASICA (8%) - 14 productos, 15 unidades, $881.200  
  { categoria: "BASICA", productos: 14, stock: 15, costoTotal: 881200 },
  
  // SKINNY (8%) - 7 productos, 7 unidades, $874.800
  { categoria: "SKINNY", productos: 7, stock: 7, costoTotal: 874800 },
  
  // SHORT (7%) - 7 productos, 10 unidades, $850.000
  { categoria: "SHORT", productos: 7, stock: 10, costoTotal: 850000 },
  
  // CORSET (5%) - 8 productos, 9 unidades, $624.000
  { categoria: "CORSET", productos: 8, stock: 9, costoTotal: 624000 },
  
  // BOTA RECTA (5%) - 4 productos, 4 unidades, $620.000
  { categoria: "BOTA RECTA", productos: 4, stock: 4, costoTotal: 620000 }
];

// Calcular totales
let totalCosto = 0;
let totalStock = 0;
let totalProductos = 0;

productosMockup.forEach(cat => {
  totalCosto += cat.costoTotal;
  totalStock += cat.stock;
  totalProductos += cat.productos;
});

console.log("📊 RESUMEN GENERAL:");
console.log(`Total productos: ${totalProductos}`);
console.log(`Total stock: ${totalStock} unidades`);
console.log(`Total costo inventario: $${totalCosto.toLocaleString('es-CO')}`);
console.log("\n" + "=".repeat(70));

// Verificar porcentajes
console.log("\n📈 VERIFICACIÓN DE PORCENTAJES:");
productosMockup.forEach(cat => {
  const porcentaje = (cat.costoTotal / totalCosto) * 100;
  const costoPromedio = cat.stock > 0 ? cat.costoTotal / cat.stock : 0;
  
  console.log(`\n🏷️  ${cat.categoria}:`);
  console.log(`   Porcentaje: ${porcentaje.toFixed(1)}%`);
  console.log(`   Productos: ${cat.productos}`);
  console.log(`   Stock: ${cat.stock} unidades`);
  console.log(`   Costo total: $${cat.costoTotal.toLocaleString('es-CO')}`);
  console.log(`   Costo promedio/unidad: $${costoPromedio.toLocaleString('es-CO', {maximumFractionDigits: 0})}`);
  
  // Verificar si coincide con tu captura
  const porcentajeCaptura = cat.categoria === "BODY" ? 12 :
                           cat.categoria === "BASICA" ? 8 :
                           cat.categoria === "SKINNY" ? 8 :
                           cat.categoria === "SHORT" ? 7 :
                           cat.categoria === "CORSET" ? 5 :
                           cat.categoria === "BOTA RECTA" ? 5 : 0;
                           
  const diferencia = Math.abs(porcentaje - porcentajeCaptura);
  const coincide = diferencia <= 0.5; // Tolerancia de 0.5%
  
  console.log(`   ✅ Esperado: ${porcentajeCaptura}% | Calculado: ${porcentaje.toFixed(1)}% | ${coincide ? '✅ COINCIDE' : '❌ DIFERENCIA: ' + diferencia.toFixed(1) + '%'}`);
});

console.log("\n🎯 CONCLUSIÓN:");
console.log("Los cálculos se basan en: (Costo_Total_Categoría / Costo_Total_Inventario) × 100");
console.log("Donde Costo_Total_Categoría = Σ(stock × costAverage) para productos de esa categoría");

console.log("\n💡 RECOMENDACIONES:");
console.log("1. Verificar que costAverage de cada producto sea correcto");
console.log("2. Verificar que el stock calculado coincida con los movimientos");
console.log("3. Revisar que garmentType esté correctamente asignado a cada producto");
