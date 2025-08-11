import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Bienvenido a ANGELOS Admin</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Esta es la base del panel administrativo. Comienza revisando <code>/products</code>.
        </p>
        <div className="mt-4">
          <Link href="/products" className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-neutral-50">
            Ver Productos →
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5"><h3 className="font-medium">Inventario valorizado</h3><p className="text-2xl mt-2">$0</p></div>
        <div className="card p-5"><h3 className="font-medium">Ingresos del mes</h3><p className="text-2xl mt-2">$0</p></div>
        <div className="card p-5"><h3 className="font-medium">Egresos del mes</h3><p className="text-2xl mt-2">$0</p></div>
      </section>
    </div>
  )
}
