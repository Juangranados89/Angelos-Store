export default function Home() {
  return (
    <div className="space-y-6">
      {/* Tarjetas métricas */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="stat"><h3>Ingresos del mes</h3><div className="v">$ 25.000</div></div>
        <div className="stat"><h3>Egresos del mes</h3><div className="v">$ 15.000</div></div>
        <div className="stat"><h3>Utilidad neta</h3><div className="v">$ 10.000</div></div>
        <div className="stat"><h3>Margen</h3><div className="v">40.0%</div></div>
      </section>

      {/* Tarjetas secundarias */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat"><h3>Inventario valorizado</h3><div className="v">$ 50.000</div></div>
        <div className="stat"><h3>Cuentas por cobrar</h3><div className="v">$ 8.000</div></div>
        <div className="stat"><h3>Gastos por pagar</h3><div className="v">$ 8.000</div></div>
      </section>

      {/* “Chart” tipo barras sencillo con CSS para no agregar librerías */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-medium mb-4">Ingresos y egresos por semana</h3>
          <div className="flex items-end gap-3 h-40">
            {[20,28,32,30,35,38,42].map((v,i)=>(
              <div key={i} className="w-8 bg-neutral-200 rounded">
                <div className="w-8 rounded-t" style={{height:`${v}%`, background:"var(--accent)"}}/>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-medium mb-4">Últimos movimientos</h3>
          <table className="w-full text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="py-2 text-left">Fecha</th>
                <th className="py-2 text-left">Tipo</th>
                <th className="py-2 text-left">Comprobante</th>
                <th className="py-2 text-left">Tercero</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["15/04/2024","Ingreso","Factura","Cliente A","$ 8000"],
                ["15/04/2024","Compra","Ingresos","Proveedor","$ 5000"],
                ["12/04/2024","Compra","Compras","Cliente A","$ 2000"],
              ].map((r,i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td>
                  <td className="py-2 text-right">{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
