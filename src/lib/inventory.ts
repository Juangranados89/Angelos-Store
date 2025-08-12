import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function getCurrentStock(productId: string){
  const agg = await prisma.inventoryMovement.groupBy({
    by: ['type'],
    where: { productId },
    _sum: { qty: true }
  });
  const sum = (t:string)=> Number(agg.find(a=>a.type===t)?._sum.qty||0);
  return sum('IN') - sum('OUT') + sum('ADJUST');
}

export async function applyPurchase(productId:string, qty:number, unitCost:Prisma.Decimal){
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if(!product) throw new Error("Producto no encontrado");
  const stock = await getCurrentStock(productId);
  const current = new Prisma.Decimal(product.costAverage);
  const q = new Prisma.Decimal(qty);
  const newAvg = stock<=0 ? unitCost : current.mul(stock).add(unitCost.mul(q)).div(new Prisma.Decimal(stock).add(q));
  await prisma.product.update({ where:{id:productId}, data:{ costAverage:newAvg } });
  await prisma.inventoryMovement.create({ data:{ productId, type:'IN', refType:'PURCHASE', refId:'auto', qty, unitCost } });
  return newAvg;
}

export async function applySale(productId:string, qty:number){
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if(!product) throw new Error("Producto no encontrado");
  await prisma.inventoryMovement.create({ data:{ productId, type:'OUT', refType:'SALE', refId:'auto', qty, unitCost: product.costAverage } });
  return product.costAverage;
}
