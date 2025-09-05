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
  costAverage: number;    // COSTO PROMEDIO
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
      { sku: "", name: "", garmentType: "", gender: "", size: "", price: 0, costAverage: 0, stock: 0, _isNew: true, _dirty: true },
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

  // Calcular métricas del inventario
  const metrics = useMemo(() => {
    let totalVenta = 0;
    let totalCosto = 0;

    filtered.forEach(row => {
      const stock = row.stock;
      const precio = row.price;
      const costo = row.costAverage; // Usar el costo promedio real
      
      totalVenta += stock * precio;
      totalCosto += stock * costo; // Costo real del inventario
    });

    const utilidadEstimada = totalVenta - totalCosto;
    const margen = totalVenta > 0 ? (utilidadEstimada / totalVenta) * 100 : 0;

    return {
      totalVenta,
      totalCosto,
      utilidadEstimada,
      margen
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Métricas del inventario */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Inventario</h2>
            <p className="text-sm text-gray-600">Gestiona los productos de tu negocio.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              onClick={addBlank}
            >
              + Agregar Producto
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Variantes Múltiples
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Stock Bajo
            </button>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-700 text-sm font-medium">Total Venta</h3>
            <div className="text-2xl font-bold text-blue-900">
              ${metrics.totalVenta.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-blue-600">Valor total al precio de venta</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-orange-700 text-sm font-medium">Total Costo</h3>
            <div className="text-2xl font-bold text-orange-900">
              ${metrics.totalCosto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-orange-600">Costo promedio del inventario</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-700 text-sm font-medium">Utilidad Estimada</h3>
            <div className="text-2xl font-bold text-green-900">
              ${metrics.utilidadEstimada.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-green-600">Ganancia potencial</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-purple-700 text-sm font-medium">Margen</h3>
            <div className="text-2xl font-bold text-purple-900">
              {metrics.margen.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-600">Porcentaje de ganancia</div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h3 className="font-medium">Productos</h3>
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
    </div>
  );
}
