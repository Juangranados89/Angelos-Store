async function getProducts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Productos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Categoría</th>
              <th className="p-2 text-right">Precio</th>
              <th className="p-2 text-right">Costo Prom.</th>
              <th className="p-2 text-right">IVA</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.category?.name ?? "—"}</td>
                <td className="p-2 text-right">{Number(p.price).toFixed(2)}</td>
                <td className="p-2 text-right">{Number(p.costAverage).toFixed(2)}</td>
                <td className="p-2 text-right">{Number(p.ivaRate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
