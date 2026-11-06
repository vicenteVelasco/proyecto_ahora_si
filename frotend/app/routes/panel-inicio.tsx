import { CalendarDays, ClipboardList } from "lucide-react";
import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/panel-inicio";
import { ETIQUETA_ROL, obtenerMiCurso, obtenerPersonaActual, type Persona } from "../api";
import { formatearFechaLarga, formatearOrdinal } from "../utilidades";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mi panel - Unidad Educativa Peribeca" }];
}

// Solo los estudiantes tienen curso
export async function clientLoader() {
  const persona = await obtenerPersonaActual();
  return persona?.rol === "estudiante" ? obtenerMiCurso() : null;
}

function saludoSegunHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-piedra">{etiqueta}</dt>
      <dd className="mt-1 break-words text-carbon">{valor}</dd>
    </div>
  );
}

export default function PanelInicio({ loaderData: curso }: Route.ComponentProps) {
  const persona = useOutletContext<Persona>();
  const iniciales = `${persona.nombre.charAt(0)}${persona.apellido.charAt(0)}`.toUpperCase();

  return (
    <>
      <p className="text-sm text-piedra">{saludoSegunHora()},</p>
      <h1 className="mt-1 font-titulo text-3xl text-carbon md:text-4xl">
        {persona.nombre} {persona.apellido}
      </h1>

      <section className="mt-6 rounded-2xl border border-piedra-clara bg-white p-5 sm:mt-8 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vinotinto to-vinotinto-oscuro font-titulo text-xl text-white">
            {iniciales}
          </div>
          <div>
            <h2 className="font-medium text-carbon">Datos personales</h2>
            <p className="text-sm text-piedra">{ETIQUETA_ROL[persona.rol]}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="Nombres" valor={persona.nombre} />
          <Dato etiqueta="Apellidos" valor={persona.apellido} />
          <Dato etiqueta="Cédula" valor={persona.cedula} />
          <Dato etiqueta="Correo" valor={persona.email ?? "—"} />
          <Dato etiqueta="Rol" valor={ETIQUETA_ROL[persona.rol]} />
          <Dato etiqueta="Registrado el" valor={formatearFechaLarga(persona.fecha_registro)} />
        </dl>
      </section>

      {persona.rol === "estudiante" && (
        <section className="mt-6 rounded-2xl border border-piedra-clara bg-white p-5 sm:p-6">
          <h2 className="font-medium text-carbon">Datos académicos</h2>
          {curso ? (
            <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Dato etiqueta="Grado / año" valor={formatearOrdinal(curso.anio)} />
              <Dato etiqueta="Sección" valor={curso.seccion} />
              <Dato etiqueta="Turno" valor={curso.turno} />
              <Dato etiqueta="Año escolar" valor={curso.anio_escolar} />
              <Dato etiqueta="Inscrito desde" valor={formatearFechaLarga(curso.fecha_inscripcion)} />
            </dl>
          ) : (
            <p className="mt-3 text-sm text-piedra">Todavía no estás inscrito en ningún curso.</p>
          )}
        </section>
      )}

      {persona.rol === "estudiante" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            to="/estudiante/notas"
            className="group flex min-h-[4.5rem] items-center gap-4 rounded-2xl border border-piedra-clara bg-white p-5 transition hover:-translate-y-0.5 hover:border-vinotinto/40 hover:shadow-lg hover:shadow-vinotinto/10"
          >
            <ClipboardList className="h-8 w-8 text-vinotinto" />
            <div>
              <p className="font-medium text-carbon">Mis notas</p>
              <p className="text-sm text-piedra">Evaluaciones y definitiva por materia</p>
            </div>
          </Link>
          <Link
            to="/estudiante/horario"
            className="group flex min-h-[4.5rem] items-center gap-4 rounded-2xl border border-piedra-clara bg-white p-5 transition hover:-translate-y-0.5 hover:border-vinotinto/40 hover:shadow-lg hover:shadow-vinotinto/10"
          >
            <CalendarDays className="h-8 w-8 text-vinotinto" />
            <div>
              <p className="font-medium text-carbon">Mi horario</p>
              <p className="text-sm text-piedra">Consulta y descarga tu horario de clases</p>
            </div>
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-sm text-piedra">El panel de tu rol está en construcción.</p>
      )}
    </>
  );
}
