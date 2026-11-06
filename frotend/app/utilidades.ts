import type { Curso, EvaluacionNota, Nota } from "./api";

// ---------------------------------------------------------------------------
// Notas
// ---------------------------------------------------------------------------

export const NOTA_APROBATORIA = 10;
// "NP" (no presentó) cuenta como 00 al calcular la definitiva.
// Si la institución lo maneja distinto, es el único valor que hay que cambiar.
export const NOTA_DE_NP = 0;

const PORCENTAJE_TOTAL = 100;
// Absorbe decimales de los porcentajes (por ejemplo 33,33 + 33,33 + 33,34)
const TOLERANCIA_PORCENTAJE = 0.1;

export type EstadoMateria =
  | "aprobada"
  | "reprobada"
  | "va_aprobando"
  | "va_reprobando"
  | "sin_notas";

export type ResumenMateria = {
  materia_id: number;
  materia: string;
  evaluaciones: EvaluacionNota[];
  definitiva: number | null;
  es_parcial: boolean;
  porcentaje_evaluado: number;
  estado: EstadoMateria;
};

export type ResumenLapso = {
  promedio: number | null;
  materias_aprobando: number;
  total_materias: number;
  evaluaciones_calificadas: number;
  evaluaciones_total: number;
};

const sumar = (valores: number[]) => valores.reduce((total, valor) => total + valor, 0);

export const aprueba = (nota: number) => nota >= NOTA_APROBATORIA;

// Nota convertida a número para calcular; null mientras la evaluación no esté calificada
export function valorNumerico(nota: Nota): number | null {
  if (nota === null) return null;
  return nota === "NP" ? NOTA_DE_NP : nota;
}

// Puntos que la evaluación suma a la definitiva (nota × porcentaje / 100)
export function aporteDeEvaluacion(evaluacion: EvaluacionNota): number | null {
  const valor = valorNumerico(evaluacion.nota);
  return valor === null ? null : (valor * evaluacion.porcentaje) / 100;
}

// Regla de la institución: la definitiva se redondea al entero más cercano.
// toFixed(4) evita que un 9,4999999 por coma flotante quede en 9 cuando debería ser 9,5
const redondearNota = (valor: number) => Math.round(Number(valor.toFixed(4)));

function decidirEstado(definitiva: number, es_parcial: boolean): EstadoMateria {
  if (es_parcial) return aprueba(definitiva) ? "va_aprobando" : "va_reprobando";
  return aprueba(definitiva) ? "aprobada" : "reprobada";
}

// Las fechas ISO se ordenan como texto; las evaluaciones sin fecha van al final
function ordenarPorFecha(evaluaciones: EvaluacionNota[]): EvaluacionNota[] {
  return [...evaluaciones].sort((a, b) => {
    if (a.fecha === b.fecha) return 0;
    if (a.fecha === null) return 1;
    if (b.fecha === null) return -1;
    return a.fecha.localeCompare(b.fecha);
  });
}

// Pondera solo lo ya calificado; es parcial mientras falte porcentaje por calificar
function resumirMateria(evaluaciones: EvaluacionNota[]): ResumenMateria {
  const calificadas = evaluaciones.flatMap((evaluacion) => {
    const valor = valorNumerico(evaluacion.nota);
    return valor === null ? [] : [{ valor, porcentaje: evaluacion.porcentaje }];
  });
  const base = {
    materia_id: evaluaciones[0].materia_id,
    materia: evaluaciones[0].materia,
    evaluaciones: ordenarPorFecha(evaluaciones),
  };

  if (calificadas.length === 0) {
    return { ...base, definitiva: null, es_parcial: true, porcentaje_evaluado: 0, estado: "sin_notas" };
  }

  const porcentaje_evaluado = sumar(calificadas.map((c) => c.porcentaje));
  const puntos = sumar(calificadas.map((c) => c.valor * c.porcentaje));
  const definitiva = redondearNota(puntos / porcentaje_evaluado);
  const es_parcial = porcentaje_evaluado < PORCENTAJE_TOTAL - TOLERANCIA_PORCENTAJE;
  return { ...base, definitiva, es_parcial, porcentaje_evaluado, estado: decidirEstado(definitiva, es_parcial) };
}

export function agruparPorMateria(evaluaciones: EvaluacionNota[], lapso: number): ResumenMateria[] {
  const porMateria = new Map<number, EvaluacionNota[]>();
  for (const evaluacion of evaluaciones) {
    if (evaluacion.lapso !== lapso) continue;
    const grupo = porMateria.get(evaluacion.materia_id) ?? [];
    grupo.push(evaluacion);
    porMateria.set(evaluacion.materia_id, grupo);
  }
  return [...porMateria.values()]
    .map(resumirMateria)
    .sort((a, b) => a.materia.localeCompare(b.materia, "es"));
}

export function resumirLapso(materias: ResumenMateria[]): ResumenLapso {
  const definitivas = materias.flatMap((materia) =>
    materia.definitiva === null ? [] : [materia.definitiva],
  );
  const evaluaciones = materias.flatMap((materia) => materia.evaluaciones);
  return {
    promedio: definitivas.length === 0 ? null : sumar(definitivas) / definitivas.length,
    materias_aprobando: materias.filter(
      (materia) => materia.estado === "aprobada" || materia.estado === "va_aprobando",
    ).length,
    total_materias: materias.length,
    evaluaciones_calificadas: evaluaciones.filter((evaluacion) => evaluacion.nota !== null).length,
    evaluaciones_total: evaluaciones.length,
  };
}

// ---------------------------------------------------------------------------
// Formatos
// ---------------------------------------------------------------------------

const SIN_DATO = "—";
const FORMATO_NUMERO = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 });
const FORMATO_PROMEDIO = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short", year: "numeric" });
const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "long", year: "numeric" });
const PATRON_SOLO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

// Las notas se muestran con dos cifras: 01 … 20 (o NP). Si trae decimales: 07,5
export function formatearNota(nota: Nota): string {
  if (nota === null) return SIN_DATO;
  if (nota === "NP") return "NP";
  const [entero, decimales] = String(Number(nota.toFixed(2))).split(".");
  return decimales ? `${entero.padStart(2, "0")},${decimales}` : entero.padStart(2, "0");
}

export const formatearPromedio = (promedio: number | null) =>
  promedio === null ? SIN_DATO : FORMATO_PROMEDIO.format(promedio);

export const formatearPuntos = (puntos: number) => FORMATO_NUMERO.format(puntos);
export const formatearPorcentaje = (porcentaje: number) => `${FORMATO_NUMERO.format(porcentaje)} %`;

// 1.er, 2.º, 3.er, 4.º ...
export const formatearOrdinal = (numero: number) =>
  numero === 1 || numero === 3 ? `${numero}.er` : `${numero}.º`;

// Una fecha sin hora ("2026-10-08") se interpreta como UTC y en Venezuela (UTC-4)
// retrocede un día; por eso se arma en hora local
function leerFechaIso(iso: string): Date {
  const coincidencia = PATRON_SOLO_FECHA.exec(iso);
  if (!coincidencia) return new Date(iso);
  const [, anio, mes, dia] = coincidencia;
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

function formatearConFormato(formato: Intl.DateTimeFormat, iso: string | null): string {
  if (!iso) return SIN_DATO;
  const fecha = leerFechaIso(iso);
  return Number.isNaN(fecha.getTime()) ? SIN_DATO : formato.format(fecha);
}

export const formatearFecha = (iso: string | null) => formatearConFormato(FORMATO_FECHA_CORTA, iso);
export const formatearFechaLarga = (iso: string | null) => formatearConFormato(FORMATO_FECHA_LARGA, iso);

// El modelo Curso no distingue grado de año, por eso solo se muestra el número
export const etiquetaCurso = (curso: Curso) =>
  `${formatearOrdinal(curso.anio)} · Sección ${curso.seccion} · ${curso.turno}`;
