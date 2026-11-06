import type { Route } from "./+types/personas";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { personaService } from "~/../src/services/persona.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Personas - Panel" }];
}

const ROLES = ["estudiante", "profesor", "control_estudio", "direccion"];

export default function Personas() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    password_hash: "",
    rol: "estudiante",
  });
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const data = await personaService.getAll();
      setPersonas(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Error al cargar personas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirCrear() {
    setEditando(null);
    setForm({ cedula: "", nombre: "", apellido: "", email: "", password_hash: "", rol: "estudiante" });
    setModal(true);
    setError("");
  }

  function abrirEditar(p: any) {
    setEditando(p);
    setForm({
      cedula: p.cedula || "",
      nombre: p.nombre || "",
      apellido: p.apellido || "",
      email: p.email || "",
      password_hash: "",
      rol: p.rol || "estudiante",
    });
    setModal(true);
    setError("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editando) {
        const data: any = { ...form };
        if (!data.password_hash) delete data.password_hash;
        await personaService.update(editando.id, data);
      } else {
        await personaService.create(form);
      }
      setModal(false);
      cargar();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Error al guardar");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Desactivar esta persona?")) return;
    try {
      await personaService.delete(id);
      cargar();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error al desactivar");
    }
  }

  return (
    <PanelLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-titulo text-3xl text-carbon">Personas</h1>
          <p className="mt-1 text-piedra">Gestión de usuarios del sistema</p>
        </div>
        <button onClick={abrirCrear} className="flex items-center gap-2 rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white transition hover:bg-vinotinto-oscuro">
          <Plus className="h-4 w-4" />
          Nueva persona
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Cédula</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Nombre</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Apellido</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Email</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Rol</th>
                <th className="px-6 py-3 text-right font-medium text-carbon">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr>
              ) : personas.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr>
              ) : (
                personas.map((p) => (
                  <tr key={p.id} className="border-t border-piedra-clara/60">
                    <td className="px-6 py-3">{p.cedula}</td>
                    <td className="px-6 py-3">{p.nombre}</td>
                    <td className="px-6 py-3">{p.apellido}</td>
                    <td className="px-6 py-3">{p.email}</td>
                    <td className="px-6 py-3 capitalize">{p.rol}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => abrirEditar(p)} className="rounded-full p-2 text-piedra transition hover:bg-vinotinto-suave hover:text-vinotinto"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => eliminar(p.id)} className="rounded-full p-2 text-piedra transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-piedra-clara px-6 py-4">
              <h2 className="font-titulo text-xl text-carbon">{editando ? "Editar persona" : "Nueva persona"}</h2>
              <button onClick={() => setModal(false)} className="rounded-full p-2 hover:bg-piedra-clara/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <label className="text-sm text-carbon">Cédula<input required value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Apellido<input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon">Correo<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon sm:col-span-2">Contraseña {editando && <span className="text-piedra">(dejar vacío para no cambiar)</span>}<input type="password" required={!editando} value={form.password_hash} onChange={(e) => setForm({ ...form, password_hash: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2" /></label>
              <label className="text-sm text-carbon sm:col-span-2">Rol<select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="mt-1 w-full rounded-lg border border-piedra-clara px-3 py-2">{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
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
