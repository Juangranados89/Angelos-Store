import {NextResponse} from 'next/server';import {prisma}from'@/lib/prisma';

// Marcar como dinámico para evitar pre-renderizado estático
export const dynamic = 'force-dynamic';

export async function GET(){const p=await prisma.product.findMany({include:{category:true}});return NextResponse.json(p)} export async function POST(req:Request){const d=await req.json();const c=await prisma.product.create({data:d});return NextResponse.json(c,{status:201})}
