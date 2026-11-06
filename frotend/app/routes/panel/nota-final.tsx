import type { Route } from "./+types/nota-final";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { notaFinalService } from "~/../src/services/nota-final.service";
import { personaService } from "~/../src/services/persona.service";
import { materiaService } from "~/../src/services/materia.service";
import { cursoService } from "~/../src/services/curso.service";
import { Calculator } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nota Final - Panel" }];
}

export default function NotaFinal() {
  const [notasFinales, setNotasFinales] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const [nf, p, m, c] = await Promise.all([notaFinalService.getAll(), personaService.getAll(), materiaService.getAll(), cursoService.getAll()]);
      setNotasFinales(nf); setEstudiantes(p); setMaterias(m); setCursos(c);
    } catch (e: any) { setMensaje(e?.response?.data?.detail || "Error al cargar"); } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  const nombreEst = (id: number) => { const e = estudiantes.find((x) => x.id === id); return e ? `${e.nombre} ${e.apellido}` : id; };
  const nombreMat = (id: number) => materias.find((x) => x.id === id)?.nombre || id;
  const nombreCur = (id: number) => { const c = cursos.find((x) => x.id === id); return c ? `${c.año}°${c.seccion} - ${c.turno}` : id; };

  async function recalcular(nf: any) {
    setMensaje("");
    try {
      await notaFinalService.calcular(nf.estudiante_id, nf.materia_id, nf.curso_id);
      setMensaje("Nota final recalculada correctamente.");
      cargar();
    } catch (e: any) {
      setMensaje(e?.response?.data?.detail || "Error al recalcular");
    }
  }

  return (
    <PanelLayout>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl text-carbon">Nota Final por Materia</h1>
        <p className="mt-1 text-piedra">Promedio ponderado de evaluaciones (almacenado en base de datos)</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Estudiante</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Materia</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Curso</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Nota Final</th>
                <th className="px-6 py-3 text-right font-medium text-carbon">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : notasFinales.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr> : notasFinales.map((nf) => (
                <tr key={nf.id} className="border-t border-piedra-clara/60">
                  <td className="px-6 py-3">{nombreEst(nf.estudiante_id)}</td>
                  <td className="px-6 py-3">{nombreMat(nf.materia_id)}</td>
                  <td className="px-6 py-3">{nombreCur(nf.curso_id)}</td>
                  <td className="px-6 py-3 font-semibold text-vinotinto">{nf.nota_final}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => recalcular(nf)} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-piedra transition hover:bg-vinotinto-suave hover:text-vinotinto"><Calculator className="h-4 w-4" />Recalcular</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mensaje && <div className="px-6 py-4 text-sm text-carbon">{mensaje}</div>}
      </div>
    </PanelLayout>
  );
}
