import type { Route } from "./+types/notas";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { notaEvaluacionService } from "~/../src/services/nota-evaluacion.service";
import { notaFinalService } from "~/../src/services/nota-final.service";
import { evaluacionService } from "~/../src/services/evaluacion.service";
import { personaService } from "~/../src/services/persona.service";
import { useAuth } from "~/hooks/use-auth";
import { Save, Calculator } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Notas - Panel" }];
}

export default function Notas() {
  const { user } = useAuth();
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>("");
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const [ev, personas] = await Promise.all([evaluacionService.getAll(), personaService.getAll()]);
      setEvaluaciones(ev);
      setEstudiantes(personas.filter((p: any) => p.rol === "estudiante" && p.activo !== false));
    } catch (e: any) {
      setMensaje(e?.response?.data?.detail || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function actualizarNota(estudianteId: number, valor: string) {
    setNotas((prev) => ({ ...prev, [estudianteId]: valor }));
  }

  async function guardarNotas() {
    if (!evaluacionSeleccionada) return;
    setGuardando(true);
    setMensaje("");
    const evalId = Number(evaluacionSeleccionada);
    const ev = evaluaciones.find((e) => e.id === evalId);
    try {
      for (const est of estudiantes) {
        const val = notas[est.id];
        if (val === undefined || val === "") continue;
        const nota = Number(val);
        if (nota < 1 || nota > 20) continue;
        try {
          await notaEvaluacionService.create({
            estudiante_id: est.id,
            evaluacion_id: evalId,
            nota,
            registrado_por: user?.id || 1,
            observacion: "",
          });
        } catch {
          // Si ya existe, se ignora silenciosamente (ya hay una nota para esa evaluación)
        }
      }
      if (ev) {
        await notaFinalService.calcular(ev.materia_id, ev.curso_id, ev.curso_id === undefined ? ev.curso_id : ev.materia_id);
      }
      // recalcular por cada estudiante para esa materia/curso
      for (const est of estudiantes) {
        const val = notas[est.id];
        if (val === undefined || val === "") continue;
        if (ev) {
          try {
            await notaFinalService.calcular(est.id, ev.materia_id, ev.curso_id);
          } catch {}
        }
      }
      setMensaje("Notas guardadas y nota final recalculada correctamente.");
    } catch (e: any) {
      setMensaje(e?.response?.data?.detail || "Error al guardar notas");
    } finally {
      setGuardando(false);
    }
  }

  const evaluacion = evaluaciones.find((e) => e.id === Number(evaluacionSeleccionada));

  return (
    <PanelLayout>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl text-carbon">Carga de Notas</h1>
        <p className="mt-1 text-piedra">Registrar calificaciones por evaluación (1 - 20)</p>
      </div>

      <div className="mb-6 rounded-2xl border border-piedra-clara bg-white p-6 shadow-sm">
        <label className="text-sm text-carbon">Seleccionar evaluación
          <select value={evaluacionSeleccionada} onChange={(e) => { setEvaluacionSeleccionada(e.target.value); setNotas({}); setMensaje(""); }} className="mt-1 w-full max-w-xl rounded-lg border border-piedra-clara px-3 py-2">
            <option value="">-- Selecciona una evaluación --</option>
            {evaluaciones.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.nombre} | Porcentaje: {ev.porcentaje}% | Fecha: {ev.fecha}</option>
            ))}
          </select>
        </label>
        {evaluacion && (
          <p className="mt-2 text-sm text-piedra">Al guardar se recalculará automáticamente la nota final ponderada para cada estudiante con nota ingresada.</p>
        )}
      </div>

      {evaluacionSeleccionada && (
        <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-piedra-clara px-6 py-4">
            <h2 className="font-titulo text-lg text-carbon">Estudiantes</h2>
            <button onClick={guardarNotas} disabled={guardando} className="flex items-center gap-2 rounded-full bg-vinotinto px-5 py-2 text-sm font-medium text-white hover:bg-vinotinto-oscuro disabled:opacity-70">
              <Save className="h-4 w-4" />
              {guardando ? "Guardando..." : "Guardar notas y recalcular"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-vinotinto-suave/40">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-carbon">Cédula</th>
                  <th className="px-6 py-3 text-left font-medium text-carbon">Estudiante</th>
                  <th className="px-6 py-3 text-left font-medium text-carbon">Nota (1-20)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={3} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : estudiantes.map((est) => (
                  <tr key={est.id} className="border-t border-piedra-clara/60">
                    <td className="px-6 py-3">{est.cedula}</td>
                    <td className="px-6 py-3">{est.nombre} {est.apellido}</td>
                    <td className="px-6 py-3">
                      <input type="number" min="1" max="20" step="0.01" value={notas[est.id] || ""} onChange={(e) => actualizarNota(est.id, e.target.value)} className="w-28 rounded-lg border border-piedra-clara px-3 py-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mensaje && <div className="px-6 py-4 text-sm text-carbon">{mensaje}</div>}
        </div>
      )}
    </PanelLayout>
  );
}
