import { headers } from "next/headers";

async function getMetrics() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;

  try {
    const res = await fetch(`${base}/api/summary`, { cache: "no-store" });
    if (!res.ok) return null; // evita throw y deja fallback
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const m = (await getMetrics()) ?? {
    ingresos: 0, egresos: 0, utilidad: 0,
    inventarioValorizado: 0, margen: 0,
  };
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
      {/* ... */}
    </div>
  );
}
