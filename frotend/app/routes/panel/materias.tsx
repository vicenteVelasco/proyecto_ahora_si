import type { Route } from "./+types/materias";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { materiaService } from "~/../src/services/materia.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Materias - Panel" }];
}

export default function Materias() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ nombre: "", codigo: "", descripcion: "" });
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    try { setMaterias(await materiaService.getAll()); } catch (e: any) { setError(e?.response?.data?.detail || "Error al cargar materias"); } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setEditando(null); setForm({ nombre: "", codigo: "", descripcion: "" }); setModal(true); setError(""); }
  function abrirEditar(m: any) { setEditando(m); setForm({ nombre: m.nombre || "", codigo: m.codigo || "", descripcion: m.descripcion || "" }); setModal(true); setError(""); }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editando) await materiaService.update(editando.id, form);
      else await materiaService.create(form);
      setModal(false);
      cargar();
    } catch (e: any) { setError(e?.response?.data?.detail || "Error al guardar"); }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Desactivar esta materia?")) return;
    try { await materiaService.delete(id); cargar(); } catch (e: any) { alert(e?.response?.data?.detail || "Error al desactivar"); }
  }

  return (
    <PanelLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl text-carbon">Materias</h1>
          <p className="mt-1 text-piedra">Catálogo de asignaturas</p>
        </div>
        <button onClick={abrirCrear} className="flex items-center gap-2 rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white hover:bg-vinotinto-oscuro"><Plus className="h-4 w-4" />Nueva materia</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Nombre</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Código</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Descripción</th>
                <th className="px-6 py-3 text-right font-medium text-carbon">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : materias.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr> : materias.map((m) => (
                <tr key={m.id} className="border-t border-piedra-clara/60">
                  <td className="px-6 py-3">{m.nombre}</td>
                  <td className="px-6 py-3">{m.codigo}</td>
                  <td className="px-6 py-3">{m.descripcion}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(m)} className="rounded-full p-2 text-piedra hover:bg-vinotinto-suave hover:text-vinotinto"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(m.id)} className="rounded-full p-2 text-piedra hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="font-titulo text-xl text-carbon">{editando ? "Editar materia" : "Nueva materia"}</h2>
              <button onClick={() => setModal(false)} className="rounded-full p-2 hover:bg-piedra-clara/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="grid gap-4 px-6 py-6">
              <label className="text-sm text-carbon">Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Código<input required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Descripción<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3">
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
