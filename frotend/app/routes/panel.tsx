import { useState } from "react";
import { CalendarDays, ClipboardList, House, LogOut, type LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/panel";
import { cerrarSesion, ETIQUETA_ROL, obtenerPersonaActual, type RolUsuario } from "../api";

type EnlaceMenu = { etiqueta: string; ruta: string; icono: LucideIcon };

const ENLACE_INICIO: EnlaceMenu = { etiqueta: "Inicio", ruta: "/panel", icono: House };

const ENLACES_POR_ROL: Record<RolUsuario, EnlaceMenu[]> = {
  estudiante: [
    ENLACE_INICIO,
    { etiqueta: "Mis notas", ruta: "/estudiante/notas", icono: ClipboardList },
    { etiqueta: "Mi horario", ruta: "/estudiante/horario", icono: CalendarDays },
  ],
  profesor: [ENLACE_INICIO],
  control_estudio: [ENLACE_INICIO],
  direccion: [ENLACE_INICIO],
};

// El panel verifica la sesión en el navegador, no en el servidor
export async function clientLoader() {
  const persona = await obtenerPersonaActual();
  if (!persona) throw redirect("/acceso");
  if (persona.debe_cambiar_password) throw redirect("/primer-acceso");
  return persona;
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-vinotinto-suave/40">
      <img
        src="/imagenes/escudo-cen-peribeca.png"
        alt=""
        className="h-16 w-16 object-contain motion-safe:animate-pulse"
      />
      <p className="text-sm text-piedra">Cargando tu panel…</p>
    </div>
  );
}

export default function Panel({ loaderData: persona }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(false);
  const enlaces = ENLACES_POR_ROL[persona.rol];
  const iniciales = `${persona.nombre.charAt(0)}${persona.apellido.charAt(0)}`.toUpperCase();

  async function alCerrarSesion() {
    setSaliendo(true);
    try {
      await cerrarSesion();
    } catch {
      // Si falla, igual se vuelve a la pantalla de acceso
    }
    navigate("/acceso");
  }

  return (
    <div className="min-h-screen bg-vinotinto-suave/40">
      <header className="sticky top-0 z-30 border-b border-piedra-clara bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/panel" className="flex items-center gap-3">
            <img
              src="/imagenes/escudo-cen-peribeca.png"
              alt="Escudo de la Unidad Educativa Peribeca"
              className="h-10 w-10 object-contain"
            />
            <span className="hidden font-titulo text-lg font-semibold text-vinotinto xl:inline">
              Unidad Educativa Peribeca
            </span>
          </Link>

          {/* En celular es una barra fija abajo (alcanzable con el pulgar); desde md va en la cabecera */}
          {enlaces.length > 1 && (
            <nav
              aria-label="Secciones"
              className="fixed inset-x-0 bottom-0 z-30 flex border-t border-piedra-clara bg-white pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:border-0 md:bg-transparent md:pb-0"
            >
              {enlaces.map(({ etiqueta, ruta, icono: Icono }) => (
                <NavLink
                  key={ruta}
                  to={ruta}
                  end
                  className={({ isActive }) =>
                    `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 border-t-2 px-2 text-xs font-medium transition md:min-h-11 md:flex-none md:flex-row md:gap-2 md:rounded-lg md:border-t-0 md:px-4 md:text-sm ${
                      isActive
                        ? "border-vinotinto text-vinotinto md:bg-vinotinto-suave"
                        : "border-transparent text-piedra hover:text-vinotinto md:text-carbon md:hover:bg-vinotinto-suave/60"
                    }`
                  }
                >
                  <Icono className="h-5 w-5 md:h-4 md:w-4" />
                  {etiqueta}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vinotinto to-vinotinto-oscuro text-xs font-semibold text-white"
              >
                {iniciales}
              </div>
              <div className="hidden min-w-0 max-w-[11rem] md:block">
                <p className="truncate text-sm font-medium text-carbon">
                  {persona.nombre} {persona.apellido}
                </p>
                <p className="truncate text-xs text-piedra">{ETIQUETA_ROL[persona.rol]}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={alCerrarSesion}
              disabled={saliendo}
              aria-label="Cerrar sesión"
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-piedra-clara text-sm text-carbon transition hover:border-vinotinto hover:text-vinotinto disabled:pointer-events-none disabled:opacity-60 xl:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">{saliendo ? "Saliendo..." : "Cerrar sesión"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 md:py-10 md:pb-10">
        <Outlet context={persona} />
      </main>
    </div>
  );
}
