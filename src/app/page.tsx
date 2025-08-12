async function getMetrics() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/metrics/summary`, { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const m = await getMetrics(); // {ingresos, egresos, cogs, utilidad, inventarioValorizado, margen}

  const fmt = (n:number)=> n.toLocaleString("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});
  const pct = (n:number)=> (n*100).toFixed(1)+"%";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="stat"><h3>Ingresos del mes</h3><div className="v">{fmt(m.ingresos)}</div></div>
        <div className="stat"><h3>Egresos del mes</h3><div className="v">{fmt(m.egresos)}</div></div>
        <div className="stat"><h3>Utilidad neta</h3><div className="v">{fmt(m.utilidad)}</div></div>
        <div className="stat"><h3>Margen</h3><div className="v">{pct(m.margen)}</div></div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat"><h3>Inventario valorizado</h3><div className="v">{fmt(m.inventarioValorizado)}</div></div>
        <div className="stat"><h3>Cuentas por cobrar</h3><div className="v">$ 0</div></div>
        <div className="stat"><h3>Gastos por pagar</h3><div className="v">$ 0</div></div>
      </section>

      {/* deja el resto del panel como lo tienes */}
    </div>
  );
}
