import type { Route } from "./+types/evaluaciones";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { evaluacionService } from "~/../src/services/evaluacion.service";
import { materiaService } from "~/../src/services/materia.service";
import { cursoService } from "~/../src/services/curso.service";
import { lapsoService } from "~/../src/services/lapso.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Evaluaciones - Panel" }];
}

export default function Evaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [lapsos, setLapsos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ materia_id: "", curso_id: "", lapso_id: "", nombre: "", porcentaje: "", fecha: "", descripcion: "" });
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const [e, m, c, l] = await Promise.all([evaluacionService.getAll(), materiaService.getAll(), cursoService.getAll(), lapsoService.getAll()]);
      setEvaluaciones(e); setMaterias(m); setCursos(c); setLapsos(l);
    } catch (e: any) { setError(e?.response?.data?.detail || "Error al cargar"); } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setEditando(null); setForm({ materia_id: "", curso_id: "", lapso_id: "", nombre: "", porcentaje: "", fecha: "", descripcion: "" }); setModal(true); setError(""); }
  function abrirEditar(ev: any) { setEditando(ev); setForm({ materia_id: ev.materia_id || "", curso_id: ev.curso_id || "", lapso_id: ev.lapso_id || "", nombre: ev.nombre || "", porcentaje: ev.porcentaje || "", fecha: ev.fecha || "", descripcion: ev.descripcion || "" }); setModal(true); setError(""); }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = { ...form, materia_id: Number(form.materia_id), curso_id: Number(form.curso_id), lapso_id: Number(form.lapso_id), porcentaje: Number(form.porcentaje) };
      if (editando) await evaluacionService.update(editando.id, data);
      else await evaluacionService.create(data);
      setModal(false);
      cargar();
    } catch (e: any) { setError(e?.response?.data?.detail || "Error al guardar"); }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Desactivar esta evaluación?")) return;
    try { await evaluacionService.delete(id); cargar(); } catch (e: any) { alert(e?.response?.data?.detail || "Error al desactivar"); }
  }

  const nombreMateria = (id: number) => materias.find((m) => m.id === id)?.nombre || id;
  const nombreCurso = (id: number) => { const c = cursos.find((x) => x.id === id); return c ? `${c.año}°${c.seccion} - ${c.turno}` : id; };
  const nombreLapso = (id: number) => lapsos.find((l) => l.id === id)?.numero || id;

  return (
    <PanelLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl text-carbon">Evaluaciones</h1>
          <p className="mt-1 text-piedra">Configuración de exámenes y tareas</p>
        </div>
        <button onClick={abrirCrear} className="flex items-center gap-2 rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white hover:bg-vinotinto-oscuro"><Plus className="h-4 w-4" />Nueva evaluación</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Nombre</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Materia</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Curso</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Lapso</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Porcentaje</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Fecha</th>
                <th className="px-6 py-3 text-right font-medium text-carbon">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : evaluaciones.length === 0 ? <tr><td colSpan={7} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr> : evaluaciones.map((ev) => (
                <tr key={ev.id} className="border-t border-piedra-clara/60">
                  <td className="px-6 py-3">{ev.nombre}</td>
                  <td className="px-6 py-3">{nombreMateria(ev.materia_id)}</td>
                  <td className="px-6 py-3">{nombreCurso(ev.curso_id)}</td>
                  <td className="px-6 py-3">Lapso {nombreLapso(ev.lapso_id)}</td>
                  <td className="px-6 py-3">{ev.porcentaje}%</td>
                  <td className="px-6 py-3">{ev.fecha}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirEditar(ev)} className="rounded-full p-2 text-piedra hover:bg-vinotinto-suave hover:text-vinotinto"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => eliminar(ev.id)} className="rounded-full p-2 text-piedra hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-piedra-clara px-6 py-4">
              <h2 className="font-titulo text-xl text-carbon">{editando ? "Editar evaluación" : "Nueva evaluación"}</h2>
              <button onClick={() => setModal(false)} className="rounded-full p-2 hover:bg-piedra-clara/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <label className="text-sm text-carbon sm:col-span-2">Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Materia<select required value={form.materia_id} onChange={(e) => setForm({ ...form, materia_id: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2"><option value="">Seleccionar</option>{materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select></label>
              <label className="text-sm text-carbon">Curso<select required value={form.curso_id} onChange={(e) => setForm({ ...form, curso_id: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2"><option value="">Seleccionar</option>{cursos.map((c) => <option key={c.id} value={c.id}>{c.año}°{c.seccion} - {c.turno}</option>)}</select></label>
              <label className="text-sm text-carbon">Lapso<select required value={form.lapso_id} onChange={(e) => setForm({ ...form, lapso_id: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2"><option value="">Seleccionar</option>{lapsos.map((l) => <option key={l.id} value={l.id}>Lapso {l.numero} - {l.año_escolar}</option>)}</select></label>
              <label className="text-sm text-carbon">Porcentaje (%)<input type="number" min="1" max="100" required value={form.porcentaje} onChange={(e) => setForm({ ...form, porcentaje: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon sm:col-span-2">Fecha<input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon sm:col-span-2">Descripción<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
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
