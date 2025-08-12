import { headers } from "next/headers";

async function getMetrics() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/metrics/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar métricas");
  return res.json();
}

export default async function Home() {
  const m = await getMetrics();
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
      {/* resto de tu panel */}
    </div>
  );
}
