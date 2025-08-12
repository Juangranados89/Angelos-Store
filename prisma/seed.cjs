const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
(async () => {
  const email = process.env.INITIAL_ADMIN_EMAIL || "admin@angelos.local";
  const pass = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
  const name = process.env.INITIAL_ADMIN_NAME || "Administrador";
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) {
    const hash = await bcrypt.hash(pass, 10);
    await prisma.user.create({ data: { email, name, password: hash, role: "ADMIN" } });
    console.log("Admin creado:", email);
  } else { console.log("Admin ya existe"); }
  const cat = await prisma.category.upsert({ where: { name: "GENERAL" }, update: {}, create: { name: "GENERAL" } });
  await prisma.product.upsert({ where: { sku: "SKU-001" }, update: {}, create: { sku: "SKU-001", name: "Producto 1", categoryId: cat.id, price: 15000, costAverage: 10000, ivaRate: 0.19 } });
  await prisma.product.upsert({ where: { sku: "SKU-002" }, update: {}, create: { sku: "SKU-002", name: "Producto 2", categoryId: cat.id, price: 40000, costAverage: 25000, ivaRate: 0.19 } });
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
