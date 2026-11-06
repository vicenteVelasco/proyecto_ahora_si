import { LogOut, User } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "~/hooks/use-auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-vinotinto-suave/20">
      <header className="sticky top-0 z-30 bg-vinotinto text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" viewTransition className="flex items-center gap-3">
            <img
              src="/imagenes/escudo-cen-peribeca.png"
              alt="Escudo de la Unidad Educativa Peribeca"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="font-titulo text-lg leading-tight">Unidad Educativa Peribeca</p>
              <p className="text-xs text-white/70">Sistema de Gestión Escolar</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <User className="h-4 w-4 text-white/80" />
              <div className="text-right">
                <p className="text-sm leading-tight">{user?.nombre || "Usuario"}</p>
                <p className="text-xs capitalize text-white/70">{user?.rol || "Sin rol"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
