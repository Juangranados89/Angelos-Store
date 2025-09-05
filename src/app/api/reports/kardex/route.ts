import {NextResponse}from'next/server';import {prisma}from'@/lib/prisma';

// Marcar como dinámico para evitar pre-renderizado estático
export const dynamic = 'force-dynamic';

export async function GET(req:Request){const{searchParams}=new URL(req.url);const sku=searchParams.get('sku')||undefined;const where=sku?{product:{sku}}:{};const moves=await prisma.inventoryMovement.findMany({where,include:{product:true},orderBy:{createdAt:'asc'}});return NextResponse.json(moves)}
