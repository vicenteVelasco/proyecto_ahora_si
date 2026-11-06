import type { Route } from "./+types/lapsos";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { lapsoService } from "~/../src/services/lapso.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Lapsos - Panel" }];
}

export default function Lapsos() {
  const [lapsos, setLapsos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ numero: "", año_escolar: "", fecha_inicio: "", fecha_fin: "" });
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    try { setLapsos(await lapsoService.getAll()); } catch (e: any) { setError(e?.response?.data?.detail || "Error al cargar lapsos"); } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setEditando(null); setForm({ numero: "", año_escolar: "", fecha_inicio: "", fecha_fin: "" }); setModal(true); setError(""); }
  function abrirEditar(l: any) { setEditando(l); setForm({ numero: l.numero || "", año_escolar: l.año_escolar || "", fecha_inicio: l.fecha_inicio || "", fecha_fin: l.fecha_fin || "" }); setModal(true); setError(""); }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = { ...form, numero: Number(form.numero) };
      if (editando) await lapsoService.update(editando.id, data);
      else await lapsoService.create(data);
      setModal(false);
      cargar();
    } catch (e: any) { setError(e?.response?.data?.detail || "Error al guardar"); }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Desactivar este lapso?")) return;
    try { await lapsoService.delete(id); cargar(); } catch (e: any) { alert(e?.response?.data?.detail || "Error al desactivar"); }
  }

  return (
    <PanelLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl text-carbon">Lapsos</h1>
          <p className="mt-1 text-piedra">Periodos de evaluación</p>
        </div>
        <button onClick={abrirCrear} className="flex items-center gap-2 rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white hover:bg-vinotinto-oscuro"><Plus className="h-4 w-4" />Nuevo lapso</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Número</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Año Escolar</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Fecha Inicio</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Fecha Fin</th>
                <th className="px-6 py-3 text-right font-medium text-carbon">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : lapsos.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr> : lapsos.map((l) => (
                <tr key={l.id} className="border-t border-piedra-clara/60">
                  <td className="px-6 py-3">{l.numero}</td>
                  <td className="px-6 py-3">{l.año_escolar}</td>
                  <td className="px-6 py-3">{l.fecha_inicio}</td>
                  <td className="px-6 py-3">{l.fecha_fin}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(l)} className="rounded-full p-2 text-piedra hover:bg-vinotinto-suave hover:text-vinotinto"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(l.id)} className="rounded-full p-2 text-piedra hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-piedra-clara px-6 py-4">
              <h2 className="font-titulo text-xl text-carbon">{editando ? "Editar lapso" : "Nuevo lapso"}</h2>
              <button onClick={() => setModal(false)} className="rounded-full p-2 hover:bg-piedra-clara/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <label className="text-sm text-carbon">Número (1-3)<input type="number" min="1" max="3" required value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Año Escolar<input required value={form.año_escolar} onChange={(e) => setForm({ ...form, año_escolar: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Fecha Inicio<input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Fecha Fin<input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              {error && <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setModal(false)} className="rounded-full px-5 py-2 text-sm text-piedra">Cancelar</button>
                <button type="submit" className="rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white hover:bg-vinotinto-oscuro">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
