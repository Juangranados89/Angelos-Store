# ANGELOS — Admin (MVP)

## Desarrollo local
```bash
npm install
cp .env.example .env   # edita DATABASE_URL
npx prisma db push
npm run dev
```

## Deploy en Render (Blueprint)
- Conecta el repo y Render detectará `render.yaml`.
- En **Environment** puedes definir:
  - `NEXT_PUBLIC_BASE_URL` = URL del servicio
  - `SEED_TOKEN` para habilitar el endpoint de bootstrap seguro

## Bootstrap (sin shell)
Visita:
```
/api/admin/bootstrap?token=TU_TOKEN
```
Esto crea el admin y 2 productos demo.

## Inventario
- UI: `/inventory`
- API: `/api/inventory`, `/api/inventory/adjust`, `/api/products`, `/api/products/[id]`
