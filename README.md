# ANGELOS — Admin (Starter)

Base mínima para panel administrativo (Inventario, Compras, Ventas, Caja, Reportes) con **Next.js 14 + Prisma + PostgreSQL**.

## Pasos locales
1. `npm install`
2. Copia `.env.example` a `.env` y completa `DATABASE_URL`.
3. `npx prisma generate`
4. `npm run dev`

## Despliegue en Render (Blueprint)
1. Sube este repo a GitHub.
2. En Render → **New** → **Blueprint** → selecciona el repo.
3. Configura `NEXT_PUBLIC_BASE_URL` con la URL que Render te asigne.
4. Tras el primer deploy: abre **Shell** del servicio y corre `npx prisma migrate deploy`.

## Endpoints
- `GET /api/products` — lista productos
- `POST /api/products` — crea un producto `{ sku, name, price, costAverage, ivaRate, stockMin }`.

> Esta base usa **promedio ponderado** para COGS. Kardex con `InventoryMovement`.
