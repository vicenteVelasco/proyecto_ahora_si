import type { Curso, EvaluacionNota, Horario, Nota, Persona, RespuestaNotas } from "./api";

// Todo este archivo se borra cuando se conecte el backend real.
// Las fechas y notas son inventadas, solo sirven para probar las pantallas.

type UsuarioPrueba = Persona & { password: string; curso_id: number | null };

const USUARIOS_PRUEBA: UsuarioPrueba[] = [
  {
    id: 9001,
    cedula: "V-31000001",
    nombre: "Valentina",
    apellido: "Rojas Contreras",
    email: "valentina.rojas@peribeca.test",
    password: "Temporal2026",
    rol: "estudiante",
    fecha_registro: "2026-09-12T08:30:00",
    debe_cambiar_password: true,
    curso_id: 9102,
  },
  {
    id: 9002,
    cedula: "V-31000002",
    nombre: "Santiago José",
    apellido: "Mora Pérez",
    email: "santiago.mora@peribeca.test",
    password: "Estudiante2026",
    rol: "estudiante",
    fecha_registro: "2025-09-15T09:00:00",
    debe_cambiar_password: false,
    curso_id: 9101,
  },
  {
    id: 9003,
    cedula: "V-31000003",
    nombre: "Marisol",
    apellido: "Duarte Alarcón",
    email: "marisol.duarte@peribeca.test",
    password: "Profesor2026",
    rol: "profesor",
    fecha_registro: "2024-09-01T10:00:00",
    debe_cambiar_password: false,
    curso_id: null,
  },
  {
    id: 9004,
    cedula: "V-31000004",
    nombre: "Héctor",
    apellido: "Quintero Silva",
    email: "hector.quintero@peribeca.test",
    password: "Control2026",
    rol: "control_estudio",
    fecha_registro: "2023-09-04T11:00:00",
    debe_cambiar_password: false,
    curso_id: null,
  },
  {
    id: 9005,
    cedula: "V-31000005",
    nombre: "Alicia",
    apellido: "Barrios Molina",
    email: "alicia.barrios@peribeca.test",
    password: "Direccion2026",
    rol: "direccion",
    fecha_registro: "2022-09-05T08:00:00",
    debe_cambiar_password: false,
    curso_id: null,
  },
];

const CURSOS_PRUEBA: Curso[] = [
  { id: 9101, anio: 3, seccion: "A", turno: "Mañana", anio_escolar: "2026-2027", fecha_inscripcion: "2026-09-10" },
  { id: 9102, anio: 1, seccion: "B", turno: "Mañana", anio_escolar: "2026-2027", fecha_inscripcion: "2026-09-12" },
];

// Valentina no tiene horario publicado: sirve para probar ese estado vacío
const HORARIOS_PRUEBA: Record<number, Horario> = {
  9101: { curso_id: 9101, imagen_url: "/datos_prueba/horario-3er-anio-a.svg", actualizado_en: "2026-09-14T10:30:00" },
  9102: { curso_id: 9102, imagen_url: null, actualizado_en: null },
};

// --- Notas ------------------------------------------------------------------

const MATERIAS = {
  castellano: { id: 10, nombre: "Castellano" },
  matematica: { id: 11, nombre: "Matemática" },
  ingles: { id: 12, nombre: "Inglés" },
  ciencias: { id: 13, nombre: "Ciencias Naturales" },
  geografia: { id: 14, nombre: "Geografía, Historia y Ciudadanía" },
  fisica: { id: 15, nombre: "Educación Física" },
  arte: { id: 16, nombre: "Arte y Patrimonio" },
};
type Materia = (typeof MATERIAS)[keyof typeof MATERIAS];
const M = MATERIAS;

function ev(
  id: number,
  materia: Materia,
  lapso: number,
  nombre: string,
  porcentaje: number,
  fecha: string,
  nota: Nota,
  observacion: string | null = null,
): EvaluacionNota {
  return { evaluacion_id: id, materia_id: materia.id, materia: materia.nombre, lapso, nombre, porcentaje, fecha, nota, observacion };
}

// Santiago va por el 2.º lapso: el 1.º está completo y el 3.º todavía no existe para él
const NOTAS_SANTIAGO: EvaluacionNota[] = [
  ev(9201, M.castellano, 1, "Ensayo", 30, "2026-09-18", 16),
  ev(9202, M.castellano, 1, "Exposición", 30, "2026-09-30", 15),
  ev(9203, M.castellano, 1, "Prueba escrita", 40, "2026-10-09", 14),
  ev(9204, M.matematica, 1, "Taller", 20, "2026-09-16", "NP"),
  ev(9205, M.matematica, 1, "Prueba 1", 40, "2026-09-25", 8, "Reforzar factorización y productos notables."),
  ev(9206, M.matematica, 1, "Prueba 2", 40, "2026-10-08", 9),
  ev(9207, M.ingles, 1, "Quiz", 25, "2026-09-17", 18),
  ev(9208, M.ingles, 1, "Presentación oral", 35, "2026-09-29", 17),
  ev(9209, M.ingles, 1, "Writing", 40, "2026-10-07", 16),
  ev(9210, M.ciencias, 1, "Informe de laboratorio", 30, "2026-09-24", 14),
  ev(9211, M.ciencias, 1, "Prueba escrita", 40, "2026-10-02", 13),
  ev(9212, M.ciencias, 1, "Maqueta del sistema solar", 30, "2026-10-10", 15),
  ev(9213, M.geografia, 1, "Mapa conceptual", 25, "2026-09-22", 17),
  ev(9214, M.geografia, 1, "Exposición", 35, "2026-10-01", 18, "Excelente dominio del tema."),
  ev(9215, M.geografia, 1, "Prueba escrita", 40, "2026-10-09", 16),
  ev(9216, M.fisica, 1, "Circuito de ejercicios", 50, "2026-09-28", 19),
  ev(9217, M.fisica, 1, "Prueba teórica", 50, "2026-10-06", 18),
  ev(9218, M.arte, 1, "Proyecto", 60, "2026-10-05", 15),
  ev(9219, M.arte, 1, "Portafolio", 40, "2026-10-09", 16),
  // 2.º lapso en curso: algunas evaluaciones ya calificadas y otras pendientes
  ev(9220, M.castellano, 2, "Lectura dirigida", 40, "2026-10-20", 17),
  ev(9221, M.castellano, 2, "Taller de redacción", 30, "2026-11-06", null),
  ev(9222, M.castellano, 2, "Prueba escrita", 30, "2026-11-20", null),
  ev(9223, M.matematica, 2, "Taller de ecuaciones", 30, "2026-10-21", 12),
  ev(9224, M.matematica, 2, "Prueba 1", 35, "2026-10-28", 9),
  ev(9225, M.matematica, 2, "Prueba 2", 35, "2026-11-18", null),
  ev(9226, M.ingles, 2, "Vocabulary quiz", 50, "2026-10-22", 15),
  ev(9227, M.ingles, 2, "Reading", 50, "2026-11-12", null),
  ev(9228, M.ciencias, 2, "Informe 1", 40, "2026-11-05", null),
  ev(9229, M.ciencias, 2, "Prueba escrita", 60, "2026-11-19", null),
  ev(9230, M.geografia, 2, "Línea del tiempo", 40, "2026-10-23", 8),
  ev(9231, M.geografia, 2, "Exposición", 60, "2026-11-13", null),
  ev(9232, M.fisica, 2, "Evaluación física", 50, "2026-10-26", 18),
  ev(9233, M.fisica, 2, "Prueba teórica", 50, "2026-11-16", null),
  ev(9234, M.arte, 2, "Dibujo", 100, "2026-10-27", 14),
];

// Valentina está en el 1.er lapso: el 2.º y el 3.º aparecen bloqueados
const NOTAS_VALENTINA: EvaluacionNota[] = [
  ev(9301, M.matematica, 1, "Diagnóstico", 20, "2026-09-22", 14),
  ev(9302, M.matematica, 1, "Prueba 1", 50, "2026-10-20", "NP"),
  ev(9303, M.matematica, 1, "Taller", 30, "2026-11-03", null),
  ev(9304, M.castellano, 1, "Dictado", 25, "2026-09-28", 17),
  ev(9305, M.castellano, 1, "Ensayo corto", 35, "2026-10-30", null),
  ev(9306, M.castellano, 1, "Prueba escrita", 40, "2026-11-10", null),
];

const NOTAS_PRUEBA: Record<number, RespuestaNotas> = {
  9002: { anio_escolar: "2026-2027", lapso_actual: 2, evaluaciones: NOTAS_SANTIAGO },
  9001: { anio_escolar: "2026-2027", lapso_actual: 1, evaluaciones: NOTAS_VALENTINA },
};

// --- Sesión y consultas -----------------------------------------------------

const CLAVE_SESION = "peribeca_prueba_sesion";

const esperar = (milisegundos: number) =>
  new Promise<void>((resolver) => setTimeout(resolver, milisegundos));

function sinCredenciales(usuario: UsuarioPrueba): Persona {
  const { password: _password, curso_id: _cursoId, ...persona } = usuario;
  return persona;
}

function usuarioEnSesion(): UsuarioPrueba | null {
  const id = window.sessionStorage.getItem(CLAVE_SESION);
  return USUARIOS_PRUEBA.find((candidato) => String(candidato.id) === id) ?? null;
}

export async function simularInicioSesion(correo: string, contrasena: string): Promise<Persona> {
  await esperar(350);
  const usuario = USUARIOS_PRUEBA.find(
    (candidato) => candidato.email?.toLowerCase() === correo.trim().toLowerCase(),
  );
  if (!usuario || usuario.password !== contrasena) {
    throw new Error("El correo o la contraseña no son correctos.");
  }
  window.sessionStorage.setItem(CLAVE_SESION, String(usuario.id));
  return sinCredenciales(usuario);
}

export async function simularPersonaActual(): Promise<Persona | null> {
  await esperar(200);
  const usuario = usuarioEnSesion();
  return usuario ? sinCredenciales(usuario) : null;
}

export async function simularCierreSesion(): Promise<void> {
  await esperar(200);
  window.sessionStorage.removeItem(CLAVE_SESION);
}

export async function simularMiCurso(): Promise<Curso | null> {
  await esperar(250);
  const usuario = usuarioEnSesion();
  return CURSOS_PRUEBA.find((curso) => curso.id === usuario?.curso_id) ?? null;
}

export async function simularMisNotas(): Promise<RespuestaNotas> {
  await esperar(350);
  const usuario = usuarioEnSesion();
  return (
    NOTAS_PRUEBA[usuario?.id ?? 0] ?? { anio_escolar: null, lapso_actual: 1, evaluaciones: [] }
  );
}

export async function simularMiHorario(): Promise<Horario | null> {
  await esperar(250);
  const usuario = usuarioEnSesion();
  return usuario?.curso_id ? (HORARIOS_PRUEBA[usuario.curso_id] ?? null) : null;
}
