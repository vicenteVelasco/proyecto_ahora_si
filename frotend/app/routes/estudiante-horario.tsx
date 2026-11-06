import { useState } from "react";
import { CalendarClock, Download, Maximize2 } from "lucide-react";
import { redirect } from "react-router";
import type { Route } from "./+types/estudiante-horario";
import { obtenerMiCurso, obtenerMiHorario, obtenerPersonaActual } from "../api";
import VisorImagen from "../components/VisorImagen";
import { etiquetaCurso, formatearFechaLarga } from "../utilidades";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Mi horario - Unidad Educativa Peribeca" }];
}

export async function clientLoader() {
  const persona = await obtenerPersonaActual();
  if (!persona) throw redirect("/acceso");
  if (persona.rol !== "estudiante") throw redirect("/panel");
  const [curso, horario] = await Promise.all([obtenerMiCurso(), obtenerMiHorario()]);
  return { curso, horario };
}

// El atributo download no funciona entre orígenes distintos; por eso se baja la imagen y se guarda como archivo
async function guardarImagen(url: string, nombre: string): Promise<void> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("No se pudo descargar la imagen.");
  const direccion = URL.createObjectURL(await respuesta.blob());
  const enlace = document.createElement("a");
  enlace.href = direccion;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(direccion);
}

function Vacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-piedra-clara bg-white px-6 py-14 text-center">
      <CalendarClock className="h-10 w-10 text-vinotinto/60" />
      <p className="mt-4 font-medium text-carbon">{titulo}</p>
      <p className="mt-1 max-w-md text-sm text-piedra">{texto}</p>
    </div>
  );
}

export default function EstudianteHorario({ loaderData }: Route.ComponentProps) {
  const { curso, horario } = loaderData;
  const [verGrande, setVerGrande] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const imagen = horario?.imagen_url ?? null;
  const descripcion = curso ? `Horario de clases de ${etiquetaCurso(curso)}` : "Horario de clases";

  async function alDescargar() {
    if (!imagen) return;
    const extension = imagen.split("?")[0].split(".").pop() ?? "png";
    setDescargando(true);
    setErrorDescarga(null);
    try {
      await guardarImagen(imagen, `horario-peribeca${curso ? `-${curso.anio}${curso.seccion}` : ""}.${extension}`);
    } catch {
      setErrorDescarga("No se pudo descargar el horario. Inténtalo de nuevo.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <>
      <h1 className="font-titulo text-3xl text-carbon md:text-4xl">Mi horario</h1>
      {curso && (
        <p className="mt-1 text-sm text-piedra">
          {etiquetaCurso(curso)} · Año escolar {curso.anio_escolar}
        </p>
      )}

      {curso === null ? (
        <Vacio
          titulo="Todavía no estás inscrito en ningún curso"
          texto="Cuando el personal administrativo te inscriba, aquí aparecerá el horario de tu curso."
        />
      ) : imagen === null ? (
        <Vacio
          titulo="Tu horario todavía no está publicado"
          texto="Cuando el personal administrativo lo suba, podrás verlo y descargarlo aquí."
        />
      ) : (
        <section className="mt-8 rounded-2xl border border-piedra-clara bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-piedra">
              Actualizado el {formatearFechaLarga(horario?.actualizado_en ?? null)}
            </p>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={() => setVerGrande(true)}
                aria-label="Ver en grande"
                className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-piedra-clara px-4 text-sm text-carbon transition hover:border-vinotinto hover:text-vinotinto"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sm:hidden">Ampliar</span>
                <span className="hidden sm:inline">Ver en grande</span>
              </button>
              <button
                type="button"
                onClick={alDescargar}
                disabled={descargando}
                className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-vinotinto to-vinotinto-oscuro px-4 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-vinotinto/30 disabled:pointer-events-none disabled:opacity-70"
              >
                <Download className="h-4 w-4" />
                {descargando ? "Descargando..." : "Descargar"}
              </button>
            </div>
          </div>

          {errorDescarga && (
            <p role="alert" className="mt-3 rounded-lg bg-vinotinto-suave px-4 py-2 text-sm text-vinotinto-oscuro">
              {errorDescarga}
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-xl border border-piedra-clara">
            <button
              type="button"
              onClick={() => setVerGrande(true)}
              aria-label="Ver el horario en grande"
              className="block w-full min-w-[640px] cursor-zoom-in md:min-w-0"
            >
              <img src={imagen} alt={descripcion} className="h-auto w-full" />
            </button>
          </div>
          <p className="mt-2 text-xs text-piedra">
            <span className="md:hidden">Desliza hacia los lados para ver todo el horario, o toca la imagen para verla en grande.</span>
            <span className="hidden md:inline">Toca la imagen para verla en grande.</span>
          </p>
        </section>
      )}

      {verGrande && imagen && (
        <VisorImagen
          diapositivas={[{ src: imagen, alt: descripcion }]}
          indiceActivo={0}
          onCerrar={() => setVerGrande(false)}
          onCambiarIndice={() => {}}
        />
      )}
    </>
  );
}
