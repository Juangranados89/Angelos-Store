"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id?: string;
  sku: string;            // REF
  name: string;           // DESCRIPCIÓN
  garmentType: string;    // TIPO PRENDA
  gender: string;         // SEXO
  size: string;           // TALLA
  price: number;          // PRECIO
  stock: number;          // CANT (calculado)
  _isNew?: boolean;
  _dirty?: boolean;
};

export default function InventoryGrid() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/inventory", { cache: "no-store" });
      setRows(await r.json());
    } catch (e: any) {
      setError("No se pudo cargar inventario");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function addBlank() {
    setRows(r => [
      { sku: "", name: "", garmentType: "", gender: "", size: "", price: 0, stock: 0, _isNew: true, _dirty: true },
      ...r,
    ]);
  }

  function setCell(i: number, key: keyof Row, value: any) {
    setRows(r => r.map((row, idx) => idx === i ? ({ ...row, [key]: value, _dirty: true }) : row));
  }

  async function save(i: number) {
    const row = rows[i];
    if (!row.sku || !row.name) { alert("REF y Descripción son obligatorios"); return; }
    setSavingId(row.id ?? "new");
    setError(null);
    try {
      if (row._isNew) {
        const res = await fetch("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: row.sku, name: row.name,
            garmentType: row.garmentType, gender: row.gender, size: row.size,
            price: row.price, costAverage: row.price, ivaRate: 0.19
          })
        });
        if (!res.ok) throw new Error(await res.text());
      } else if (row.id) {
        const res = await fetch(`/api/products/${row.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: row.sku, name: row.name,
            garmentType: row.garmentType, gender: row.gender, size: row.size,
            price: row.price
          })
        });
        if (!res.ok) throw new Error(await res.text());
      }
      await load();
    } catch (e: any) {
      setError("No se pudo guardar: " + e.message);
    } finally {
      setSavingId(null);
    }
  }

  async function remove(i: number) {
    const row = rows[i];
    if (!row.id) { setRows(r => r.filter((_, idx) => idx !== i)); return; }
    if (!confirm("¿Borrar producto?")) return;
    setSavingId(row.id);
    try {
      const res = await fetch(`/api/products/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e: any) {
      setError("No se pudo borrar: " + e.message);
    } finally {
      setSavingId(null);
    }
  }

  async function adjust(i: number, delta: number) {
    const row = rows[i];
    if (!row.id || !delta) return;
    setSavingId(row.id);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: row.id, delta })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e: any) {
      setError("No se pudo ajustar: " + e.message);
    } finally {
      setSavingId(null);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.sku, r.name, r.garmentType, r.gender, r.size].some(v => (v ?? "").toLowerCase().includes(s))
    );
  }, [rows, q]);

  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold">Inventario</h2>
        <div className="flex items-center gap-2">
          <input className="input" placeholder="Buscar…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={load}>Recargar</button>
          <button className="btn" onClick={addBlank}>+ Nuevo</button>
        </div>
      </div>

      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      {loading ? <div>Cargando…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">REF</th>
                <th className="p-2">DESCRIPCIÓN</th>
                <th className="p-2">TIPO PRENDA</th>
                <th className="p-2">SEXO</th>
                <th className="p-2">TALLA</th>
                <th className="p-2 text-right">PRECIO</th>
                <th className="p-2 text-right">CANT</th>
                <th className="p-2 text-right">AJUSTE</th>
                <th className="p-2 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id ?? "new-"+i} className="border-t">
                  <td className="p-2"><input className="input" value={row.sku} onChange={e=>setCell(i,"sku",e.target.value)} /></td>
                  <td className="p-2"><input className="input" value={row.name} onChange={e=>setCell(i,"name",e.target.value)} /></td>
                  <td className="p-2"><input className="input" value={row.garmentType} onChange={e=>setCell(i,"garmentType",e.target.value)} /></td>
                  <td className="p-2">
                    <select className="input" value={row.gender} onChange={e=>setCell(i,"gender",e.target.value)}>
                      <option value="">—</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="UNI">Unisex</option>
                    </select>
                  </td>
                  <td className="p-2"><input className="input" value={row.size} onChange={e=>setCell(i,"size",e.target.value)} placeholder="S/M/L/28…" /></td>
                  <td className="p-2"><input className="input text-right" type="number" step="0.01" value={row.price}
                      onChange={e=>setCell(i,"price",Number(e.target.value))} /></td>
                  <td className="p-2 text-right">{row.stock}</td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-end">
                      <button className="btn" onClick={()=>adjust(i, +1)}>+1</button>
                      <button className="btn" onClick={()=>adjust(i, -1)}>-1</button>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 justify-end">
                      <button className="btn" disabled={savingId===row.id || savingId==="new"} onClick={()=>save(i)}>
                        Guardar
                      </button>
                      <button className="btn" disabled={savingId===row.id} onClick={()=>remove(i)}>Borrar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="p-3 text-neutral-500" colSpan={9}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
