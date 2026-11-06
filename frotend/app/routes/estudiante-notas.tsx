import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { redirect } from "react-router";
import type { Route } from "./+types/estudiante-notas";
import { obtenerMisNotas, obtenerPersonaActual, type Nota } from "../api";
import {
  agruparPorMateria,
  aporteDeEvaluacion,
  aprueba,
  formatearFecha,
  formatearNota,
  formatearOrdinal,
  formatearPorcentaje,
  formatearPromedio,
  formatearPuntos,
  NOTA_APROBATORIA,
  NOTA_DE_NP,
  resumirLapso,
  type EstadoMateria,
  type ResumenMateria,
} from "../utilidades";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mis notas - Unidad Educativa Peribeca" }];
}

export async function clientLoader() {
  const persona = await obtenerPersonaActual();
  if (!persona) throw redirect("/acceso");
  if (persona.rol !== "estudiante") throw redirect("/panel");
  return obtenerMisNotas();
}

const LAPSOS = [1, 2, 3];

const ESTADOS: Record<EstadoMateria, { texto: string; clases: string }> = {
  aprobada: { texto: "Aprobada", clases: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  va_aprobando: { texto: "Va aprobando", clases: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  reprobada: { texto: "Reprobada", clases: "bg-vinotinto-suave text-vinotinto ring-vinotinto/20" },
  va_reprobando: { texto: "Va reprobando", clases: "bg-vinotinto-suave text-vinotinto ring-vinotinto/20" },
  sin_notas: { texto: "Sin notas", clases: "bg-piedra-clara/60 text-piedra ring-piedra-clara" },
};

function clasesNota(nota: Nota): string {
  if (nota === null) return "italic text-piedra";
  if (nota === "NP") return "bg-piedra-clara font-semibold text-carbon";
  return aprueba(nota)
    ? "bg-emerald-50 font-semibold text-emerald-800"
    : "bg-vinotinto-suave font-semibold text-vinotinto";
}

const textoNota = (nota: Nota) => (nota === null ? "Pendiente" : formatearNota(nota));

const CELDA = "border border-piedra-clara px-3 py-2";

function SelectorLapso({
  lapsoActual,
  seleccionado,
  alElegir,
}: {
  lapsoActual: number;
  seleccionado: number;
  alElegir: (lapso: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-piedra">Lapso</p>
      <div className="flex gap-2" role="group" aria-label="Lapso">
        {LAPSOS.map((lapso) => {
          const bloqueado = lapso > lapsoActual;
          const activo = lapso === seleccionado;
          const nombre = `${formatearOrdinal(lapso)} lapso`;
          return (
            <button
              key={lapso}
              type="button"
              disabled={bloqueado}
              aria-pressed={activo}
              aria-label={nombre}
              title={bloqueado ? "Este lapso aún no ha iniciado" : undefined}
              onClick={() => alElegir(lapso)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium transition sm:flex-none sm:px-6 ${
                activo
                  ? "border-vinotinto bg-vinotinto text-white"
                  : bloqueado
                    ? "cursor-not-allowed border-piedra-clara bg-white/60 text-piedra/60"
                    : "border-piedra-clara bg-white text-carbon hover:border-vinotinto hover:text-vinotinto"
              }`}
            >
              {bloqueado && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              <span aria-hidden="true">
                {formatearOrdinal(lapso)}
                <span className="hidden sm:inline"> lapso</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// En celular cada indicador es una fila compacta; desde sm son tarjetas
function Indicador({ titulo, valor, detalle }: { titulo: string; valor: string; detalle: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 rounded-xl border border-piedra-clara bg-white px-4 py-3 sm:block sm:rounded-2xl sm:p-4">
      <p className="text-xs uppercase tracking-wide text-piedra">{titulo}</p>
      <p className="col-start-2 row-span-2 row-start-1 font-titulo text-2xl text-carbon sm:mt-1 sm:text-3xl">
        {valor}
      </p>
      <p className="text-xs text-piedra">{detalle}</p>
    </div>
  );
}

function ListaMaterias({
  materias,
  seleccionada,
  alElegir,
}: {
  materias: ResumenMateria[];
  seleccionada: number;
  alElegir: (id: number) => void;
}) {
  const listaRef = useRef<HTMLUListElement>(null);

  // En celular la lista se desliza de lado: al cambiar de materia o de lapso, la elegida debe quedar a la vista
  useEffect(() => {
    const lista = listaRef.current;
    const activa = lista?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!lista || !activa) return;
    const distancia = activa.getBoundingClientRect().left - lista.getBoundingClientRect().left;
    const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ left: lista.scrollLeft + distancia - 16, behavior: sinAnimacion ? "auto" : "smooth" });
  }, [seleccionada, materias]);

  return (
    <nav aria-label="Materias" className="min-w-0">
      <h2 className="mb-2 text-xs uppercase tracking-wide text-piedra">Materias</h2>
      <ul
        ref={listaRef}
        className="-mx-4 flex snap-x scroll-pl-4 gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-pl-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:flex lg:flex-col"
      >
        {materias.map((materia) => {
          const activa = materia.materia_id === seleccionada;
          return (
            <li key={materia.materia_id} className="shrink-0 snap-start md:shrink">
              <button
                type="button"
                aria-current={activa ? "true" : undefined}
                onClick={() => alElegir(materia.materia_id)}
                className={`flex min-h-14 w-56 items-center justify-between gap-3 rounded-xl border px-4 py-2 text-left transition md:w-full ${
                  activa
                    ? "border-vinotinto bg-white shadow-md shadow-vinotinto/10"
                    : "border-piedra-clara bg-white/70 hover:border-vinotinto/50 hover:bg-white"
                }`}
              >
                <span className="min-w-0">
                  <span
                    title={materia.materia}
                    className={`block truncate text-sm font-medium ${activa ? "text-vinotinto" : "text-carbon"}`}
                  >
                    {materia.materia}
                  </span>
                  <span className="block text-xs text-piedra">{ESTADOS[materia.estado].texto}</span>
                </span>
                <span
                  className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-semibold ring-1 ${ESTADOS[materia.estado].clases}`}
                >
                  {formatearNota(materia.definitiva)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TablaNotas({ materia, lapso }: { materia: ResumenMateria; lapso: number }) {
  const estado = ESTADOS[materia.estado];
  const aporteTotal = materia.evaluaciones.reduce(
    (total, evaluacion) => total + (aporteDeEvaluacion(evaluacion) ?? 0),
    0,
  );

  return (
    <article className="min-w-0 rounded-2xl border border-piedra-clara bg-white">
      <header className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="font-titulo text-xl text-carbon sm:text-2xl">{materia.materia}</h2>
          <p className="text-sm text-piedra">{formatearOrdinal(lapso)} lapso</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-piedra">
            Definitiva{materia.es_parcial && materia.definitiva !== null ? " parcial" : ""}
          </p>
          <p className="font-titulo text-4xl text-carbon">{formatearNota(materia.definitiva)}</p>
          <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${estado.clases}`}>
            {estado.texto}
          </span>
        </div>
      </header>

      {materia.es_parcial && materia.definitiva !== null && (
        <p className="mx-4 mb-4 rounded-lg bg-dorado-suave px-4 py-2 text-sm text-carbon sm:mx-5">
          Calculada con el {formatearPorcentaje(materia.porcentaje_evaluado)} ya evaluado. Cambiará cuando se
          califiquen las evaluaciones pendientes.
        </p>
      )}

      {/* Celular: una tarjeta por evaluación, sin desplazamiento horizontal */}
      <ul className="space-y-3 px-4 md:hidden">
        {materia.evaluaciones.map((evaluacion) => {
          const aporte = aporteDeEvaluacion(evaluacion);
          return (
            <li key={evaluacion.evaluacion_id} className="rounded-xl border border-piedra-clara p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-carbon">{evaluacion.nombre}</p>
                  <p className="mt-0.5 text-xs text-piedra">
                    {formatearFecha(evaluacion.fecha)} · Valor {formatearPorcentaje(evaluacion.porcentaje)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${clasesNota(evaluacion.nota)}`}
                  title={evaluacion.nota === "NP" ? "No presentó" : undefined}
                >
                  {textoNota(evaluacion.nota)}
                </span>
              </div>
              {aporte !== null && (
                <p className="mt-2 text-xs text-piedra">Aporta {formatearPuntos(aporte)} puntos a la definitiva</p>
              )}
              {evaluacion.observacion && (
                <p className="mt-2 rounded-lg bg-piedra-clara/40 px-3 py-2 text-xs text-piedra">
                  {evaluacion.observacion}
                </p>
              )}
            </li>
          );
        })}
        <li className="flex justify-between gap-3 rounded-lg bg-vinotinto-suave/60 px-4 py-2 text-sm font-medium text-carbon">
          <span>Total evaluado {formatearPorcentaje(materia.porcentaje_evaluado)}</span>
          <span>Aporta {formatearPuntos(aporteTotal)}</span>
        </li>
      </ul>

      {/* Tablet y escritorio: cuadrícula tipo hoja de cálculo */}
      <div className="hidden overflow-x-auto px-5 pb-1 md:block">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <caption className="sr-only">
            Notas de {materia.materia} en el {formatearOrdinal(lapso)} lapso
          </caption>
          <thead>
            <tr className="bg-vinotinto-suave text-xs uppercase tracking-wide text-vinotinto-oscuro">
              <th scope="col" className={`${CELDA} w-10 text-center`}>
                <span className="sr-only">Número</span>
              </th>
              <th scope="col" className={`${CELDA} text-left`}>Evaluación</th>
              <th scope="col" className={`${CELDA} text-left`}>Fecha</th>
              <th scope="col" className={`${CELDA} text-center`} title="Peso de la evaluación en la definitiva del lapso">
                Valor
              </th>
              <th scope="col" className={`${CELDA} text-center`}>Nota</th>
              <th scope="col" className={`${CELDA} text-center`} title="Puntos que suma a la definitiva (nota × valor)">
                Aporta
              </th>
              <th scope="col" className={`${CELDA} text-left`}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {materia.evaluaciones.map((evaluacion, indice) => {
              const aporte = aporteDeEvaluacion(evaluacion);
              return (
                <tr key={evaluacion.evaluacion_id} className="odd:bg-white even:bg-vinotinto-suave/20">
                  <td className={`${CELDA} bg-vinotinto-suave/60 text-center text-xs text-piedra`}>{indice + 1}</td>
                  <th scope="row" className={`${CELDA} text-left font-medium text-carbon`}>
                    {evaluacion.nombre}
                  </th>
                  <td className={`${CELDA} whitespace-nowrap text-piedra`}>{formatearFecha(evaluacion.fecha)}</td>
                  <td className={`${CELDA} text-center`}>{formatearPorcentaje(evaluacion.porcentaje)}</td>
                  <td
                    className={`${CELDA} text-center ${clasesNota(evaluacion.nota)}`}
                    title={evaluacion.nota === "NP" ? "No presentó" : undefined}
                  >
                    {textoNota(evaluacion.nota)}
                  </td>
                  <td className={`${CELDA} text-center text-piedra`}>
                    {aporte === null ? "—" : formatearPuntos(aporte)}
                  </td>
                  <td className={`${CELDA} text-piedra`}>{evaluacion.observacion ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-vinotinto-suave/60 font-medium text-carbon">
              <td colSpan={3} className={`${CELDA} text-right`}>Total evaluado</td>
              <td className={`${CELDA} text-center`}>{formatearPorcentaje(materia.porcentaje_evaluado)}</td>
              <td className={CELDA} />
              <td className={`${CELDA} text-center`}>{formatearPuntos(aporteTotal)}</td>
              <td className={CELDA} />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="p-4 text-xs text-piedra sm:p-5">
        Escala del 01 al 20 · Mínimo aprobatorio: {NOTA_APROBATORIA} · NP: no presentó (cuenta como{" "}
        {formatearNota(NOTA_DE_NP)}).
      </p>
    </article>
  );
}

export default function EstudianteNotas({ loaderData }: Route.ComponentProps) {
  const { anio_escolar, lapso_actual, evaluaciones } = loaderData;
  const [lapso, setLapso] = useState(lapso_actual);
  const [materiaElegida, setMateriaElegida] = useState<number | null>(null);

  const materias = agruparPorMateria(evaluaciones, lapso);
  const materia = materias.find((candidata) => candidata.materia_id === materiaElegida) ?? materias[0];
  const resumen = resumirLapso(materias);

  return (
    <>
      <h1 className="font-titulo text-3xl text-carbon md:text-4xl">Mis notas</h1>
      <p className="mt-1 text-sm text-piedra">
        {anio_escolar ? `Año escolar ${anio_escolar}` : "Sin año escolar asignado"}
      </p>

      {anio_escolar === null ? (
        <p className="mt-8 rounded-2xl border border-piedra-clara bg-white p-6 text-piedra">
          Todavía no estás inscrito en ningún curso, por eso aún no hay notas para mostrar.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <SelectorLapso lapsoActual={lapso_actual} seleccionado={lapso} alElegir={setLapso} />
          </div>

          {materia === undefined ? (
            <p className="mt-6 rounded-2xl border border-piedra-clara bg-white p-6 text-piedra">
              Aún no hay evaluaciones registradas en este lapso.
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-4">
                <Indicador
                  titulo="Promedio del lapso"
                  valor={formatearPromedio(resumen.promedio)}
                  detalle="De las materias con nota"
                />
                <Indicador
                  titulo="Materias aprobando"
                  valor={`${resumen.materias_aprobando} de ${resumen.total_materias}`}
                  detalle={`Con ${NOTA_APROBATORIA} o más`}
                />
                <Indicador
                  titulo="Evaluaciones calificadas"
                  valor={`${resumen.evaluaciones_calificadas} de ${resumen.evaluaciones_total}`}
                  detalle="Las demás están pendientes"
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
                <ListaMaterias
                  materias={materias}
                  seleccionada={materia.materia_id}
                  alElegir={setMateriaElegida}
                />
                <TablaNotas materia={materia} lapso={lapso} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
