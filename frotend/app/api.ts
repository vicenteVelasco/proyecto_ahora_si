import {
  simularCierreSesion,
  simularInicioSesion,
  simularMiCurso,
  simularMiHorario,
  simularMisNotas,
  simularPersonaActual,
} from "./datos_prueba";
import http from "../src/services/http";

// Con true no hace falta el backend: se usan los datos de datos_prueba.ts
const USAR_DATOS_PRUEBA = true;
const URL_API = "http://localhost:8000";

export type RolUsuario = "estudiante" | "profesor" | "control_estudio" | "direccion";

export type Persona = {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string | null;
  rol: RolUsuario;
  fecha_registro: string | null;
  debe_cambiar_password: boolean;
};

export type Curso = {
  id: number;
  anio: number;
  seccion: string;
  turno: string;
  anio_escolar: string;
  fecha_inscripcion: string | null;
};

// Entre 1 y 20, "NP" si no presentó, o null si la evaluación aún no se califica
export type Nota = number | "NP" | null;

export type EvaluacionNota = {
  evaluacion_id: number;
  materia_id: number;
  materia: string;
  lapso: number;
  nombre: string;
  porcentaje: number;
  fecha: string | null;
  nota: Nota;
  observacion: string | null;
};

// Solo incluye los lapsos ya iniciados: un estudiante no ve los futuros
export type RespuestaNotas = {
  anio_escolar: string | null;
  lapso_actual: number;
  evaluaciones: EvaluacionNota[];
};

export type Horario = {
  curso_id: number;
  imagen_url: string | null;
  actualizado_en: string | null;
};

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  estudiante: "Estudiante",
  profesor: "Profesor",
  control_estudio: "Control de estudios",
  direccion: "Dirección",
};

async function pedir(metodo: string, ruta: string, cuerpo?: unknown): Promise<Response> {
  try {
    const method = metodo.toLowerCase();
    if (method === "get") {
      const res = await http.get(ruta);
      return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
    }
    if (method === "post") {
      const res = await http.post(ruta, cuerpo);
      return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
    }
    if (method === "delete") {
      const res = await http.delete(ruta);
      return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
    }
    const res = await (http as any).request({ method, url: ruta, data: cuerpo });
    return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    if (error?.response) {
      const data = error.response.data;
      return new Response(typeof data === "string" ? data : JSON.stringify(data), { status: error.response.status, headers: { "Content-Type": "application/json" } });
    }
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }
}

// El layout y las rutas hijas piden la persona a la vez; comparten una sola consulta
let consultaEnVuelo: Promise<Persona | null> | null = null;

async function consultarPersona(): Promise<Persona | null> {
  if (USAR_DATOS_PRUEBA) return simularPersonaActual();
  try {
    const respuesta = await pedir("GET", "/persona/yo");
    if (respuesta.status === 401) return null;
    if (!respuesta.ok) throw new Error("No se pudo verificar tu sesión. Inténtalo de nuevo.");
    return (await respuesta.json()) as Persona;
  } catch (e: any) {
    if (e?.response?.status === 401) return null;
    throw e;
  }
}

export function obtenerPersonaActual(): Promise<Persona | null> {
  consultaEnVuelo ??= consultarPersona().finally(() => {
    consultaEnVuelo = null;
  });
  return consultaEnVuelo;
}

// POST /persona/login ya existe; el backend solo acepta correo
export async function iniciarSesion(correo: string, contrasena: string): Promise<Persona> {
  if (USAR_DATOS_PRUEBA) return simularInicioSesion(correo, contrasena);
  try {
    const respuesta = await pedir("POST", "/persona/login", { email: correo, password: contrasena });
    if (respuesta.status === 401) throw new Error("El correo o la contraseña no son correctos.");
    if (!respuesta.ok) throw new Error("No se pudo iniciar sesión. Inténtalo de nuevo.");
    consultaEnVuelo = null;
    const persona = await obtenerPersonaActual();
    if (!persona) throw new Error("El servidor aceptó el acceso pero no se pudo iniciar la sesión.");
    return persona;
  } catch (e: any) {
    if (e?.response?.status === 401) throw new Error("El correo o la contraseña no son correctos.");
    throw e;
  }
}

export async function cerrarSesion(): Promise<void> {
  if (USAR_DATOS_PRUEBA) return simularCierreSesion();
  try {
    const respuesta = await pedir("POST", "/persona/logout");
    if (!respuesta.ok) throw new Error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    consultaEnVuelo = null;
  } catch {
    throw new Error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
  }
}

// GET /estudiante_curso/mi-curso
export async function obtenerMiCurso(): Promise<Curso | null> {
  if (USAR_DATOS_PRUEBA) return simularMiCurso();
  try {
    const respuesta = await pedir("GET", "/estudiante_curso/mi-curso");
    if (respuesta.status === 404) return null;
    if (respuesta.status === 401) return null;
    if (!respuesta.ok) throw new Error("No se pudo cargar tu curso. Inténtalo de nuevo.");
    return (await respuesta.json()) as Curso;
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 401) return null;
    throw e;
  }
}

type EvaluacionCruda = Omit<EvaluacionNota, "porcentaje" | "nota"> & {
  porcentaje: number | string;
  nota: number | string | null;
};

// GET /nota_evaluacion/mis-notas
export async function obtenerMisNotas(): Promise<RespuestaNotas> {
  if (USAR_DATOS_PRUEBA) return simularMisNotas();
  try {
    const respuesta = await pedir("GET", "/nota_evaluacion/mis-notas");
    if (respuesta.status === 404) return { anio_escolar: null, lapso_actual: 1, evaluaciones: [] };
    if (respuesta.status === 401) return { anio_escolar: null, lapso_actual: 1, evaluaciones: [] };
    if (!respuesta.ok) throw new Error("No se pudieron cargar tus notas. Inténtalo de nuevo.");
    const datos = (await respuesta.json()) as Omit<RespuestaNotas, "evaluaciones"> & {
      evaluaciones: EvaluacionCruda[];
    };
    return {
      ...datos,
      evaluaciones: (datos.evaluaciones || []).map((evaluacion) => ({
        ...evaluacion,
        porcentaje: Number(evaluacion.porcentaje),
        nota: evaluacion.nota === null || evaluacion.nota === "NP" ? evaluacion.nota : Number(evaluacion.nota),
      })),
    };
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 401) return { anio_escolar: null, lapso_actual: 1, evaluaciones: [] };
    throw e;
  }
}

// GET /horario/mi-curso
export async function obtenerMiHorario(): Promise<Horario | null> {
  if (USAR_DATOS_PRUEBA) return simularMiHorario();
  try {
    const respuesta = await pedir("GET", "/horario/mi-curso");
    if (respuesta.status === 404) return null;
    if (respuesta.status === 401) return null;
    if (!respuesta.ok) throw new Error("No se pudo cargar tu horario. Inténtalo de nuevo.");
    const horario = (await respuesta.json()) as Horario;
    const imagen_url = horario.imagen_url?.startsWith("/") ? `${URL_API}${horario.imagen_url}` : horario.imagen_url;
    return { ...horario, imagen_url };
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 401) return null;
    throw e;
  }
}
