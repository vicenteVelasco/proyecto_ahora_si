import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/acceso";
import { iniciarSesion, obtenerPersonaActual, type Persona } from "../api";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Acceso - Unidad Educativa Peribeca" }];
}

const ROLES_SISTEMA = ["Estudiantes", "Docentes", "Control de estudios", "Dirección"];

const rutaInicial = (persona: Persona) =>
  persona.debe_cambiar_password ? "/primer-acceso" : "/panel";

export default function Acceso() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay una sesión abierta no tiene sentido pedir el acceso otra vez
  useEffect(() => {
    obtenerPersonaActual()
      .then((persona) => {
        if (persona) navigate(rutaInicial(persona), { replace: true });
      })
      .catch(() => {
        // Sin conexión con el backend: se deja el formulario disponible
      });
  }, [navigate]);

  async function alEnviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      const persona = await iniciarSesion(String(datos.get("correo")), String(datos.get("contrasena")));
      navigate(rutaInicial(persona));
    } catch (falla) {
      setError(falla instanceof Error ? falla.message : "No se pudo iniciar sesión. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <main className="order-1 flex items-center justify-center px-6 py-10 md:order-2 md:py-16">
        <form onSubmit={alEnviarFormulario} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img
              src="/imagenes/escudo-cen-peribeca.png"
              alt="Escudo de la Unidad Educativa Peribeca"
              className="h-12 w-12 object-contain"
            />
            <p className="font-titulo text-lg font-semibold text-vinotinto">Unidad Educativa Peribeca</p>
          </div>

          <h2 className="font-titulo text-2xl text-carbon">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-piedra">
            Ingresa con las credenciales que te asignó la institución.
          </p>

          <label className="mt-8 block text-sm font-medium text-carbon">
            Correo electrónico
            <input
              type="email"
              name="correo"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-lg border border-piedra-clara px-4 py-2.5 text-carbon outline-none transition focus:border-vinotinto focus:ring-4 focus:ring-vinotinto/10"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-carbon">
            Contraseña
            <input
              type="password"
              name="contrasena"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-lg border border-piedra-clara px-4 py-2.5 text-carbon outline-none transition focus:border-vinotinto focus:ring-4 focus:ring-vinotinto/10"
            />
          </label>

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-vinotinto to-vinotinto-oscuro py-2.5 font-medium text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-vinotinto/30 disabled:pointer-events-none disabled:opacity-70"
          >
            {enviando ? "Verificando..." : "Iniciar sesión"}
          </button>

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg bg-vinotinto-suave px-4 py-3 text-sm text-vinotinto-oscuro"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <span
            title="Disponible próximamente"
            className="mt-6 block cursor-not-allowed text-sm text-piedra"
          >
            ¿Olvidaste tu contraseña?
          </span>

          <Link
            to="/"
            viewTransition
            className="mt-4 inline-flex min-h-11 items-center text-sm text-piedra transition hover:text-vinotinto md:hidden"
          >
            ← Volver al inicio
          </Link>
        </form>
      </main>

      <aside className="relative order-2 flex flex-col justify-between overflow-hidden px-10 py-12 text-white md:order-1">
        <div className="absolute inset-0 bg-[url('/imagenes/entrada-cen-1947-lateral.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-vinotinto/95 via-vinotinto/92 to-vinotinto-oscuro/95" />

        <div className="relative z-10">
          <Link
            to="/"
            viewTransition
            className="hidden min-h-11 items-center text-sm text-white/80 transition hover:text-white md:inline-flex"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-10 flex items-center gap-3">
            <img
              src="/imagenes/escudo-cen-peribeca.png"
              alt="Escudo de la Unidad Educativa Peribeca"
              className="h-14 w-14 object-contain"
            />
            <p className="font-titulo text-2xl">Unidad Educativa Peribeca</p>
          </div>

          <h1 className="mt-6 font-titulo text-4xl leading-tight">Acceso al sistema</h1>
          <p className="mt-4 max-w-sm text-white/80">
            Un solo formulario de entrada para toda la comunidad educativa.
          </p>

          <ul className="mt-8 space-y-2 text-sm text-white/80">
            {ROLES_SISTEMA.map((rol) => (
              <li key={rol} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-dorado" />
                {rol}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">Desde 1947</p>
      </aside>
    </div>
  );
}
