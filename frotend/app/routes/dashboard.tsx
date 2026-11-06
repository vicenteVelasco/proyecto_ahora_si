import type { Route } from "./+types/dashboard";
import { useAuth } from "~/hooks/use-auth";
import AppLayout from "~/components/layout/app-layout";
import ProtectedRoute from "~/components/auth/protected-route";
import { Link } from "react-router";
import { BookOpen, GraduationCap, Users, ClipboardList, FileText, BarChart3 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Panel - Unidad Educativa Peribeca" }];
}

export default function Dashboard() {
  const { user } = useAuth();

  const accesos = [
    { titulo: "Personas", descripcion: "Gestión de estudiantes, docentes y personal", icono: Users, href: "/panel/personas", roles: ["direccion", "control_estudio"] },
    { titulo: "Cursos", descripcion: "Años, secciones y turnos", icono: GraduationCap, href: "/panel/cursos", roles: ["direccion", "control_estudio"] },
    { titulo: "Materias", descripcion: "Catálogo de asignaturas", icono: BookOpen, href: "/panel/materias", roles: ["direccion", "control_estudio"] },
    { titulo: "Evaluaciones", descripcion: "Crear y configurar evaluaciones", icono: ClipboardList, href: "/panel/evaluaciones", roles: ["direccion", "control_estudio", "profesor"] },
    { titulo: "Notas", descripcion: "Carga y edición de calificaciones", icono: FileText, href: "/panel/notas", roles: ["direccion", "control_estudio", "profesor"] },
    { titulo: "Auditoría", descripcion: "Historial de acciones del sistema", icono: BarChart3, href: "/panel/auditoria", roles: ["direccion"] },
  ];

  const rolUsuario = user?.rol || "";
  const accesosFiltrados = accesos.filter((a) => a.roles.includes(rolUsuario));

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mb-8">
          <h1 className="font-titulo text-3xl text-carbon">Bienvenido(a), {user?.nombre || "Usuario"}</h1>
          <p className="mt-1 text-piedra">Panel de gestión escolar · Rol: <span className="capitalize">{rolUsuario || "sin asignar"}</span></p>
        </div>

        {accesosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-piedra-clara bg-white p-8 text-center shadow-sm">
            <p className="text-piedra">No hay módulos disponibles para tu rol en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {accesosFiltrados.map((acceso) => {
              const Icono = acceso.icono;
              return (
                <Link
                  key={acceso.titulo}
                  to={acceso.href}
                  viewTransition
                  className="group relative overflow-hidden rounded-2xl border border-piedra-clara bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-vinotinto-suave/60 transition group-hover:scale-110" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-vinotinto to-vinotinto-oscuro text-white shadow-md">
                      <Icono className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-titulo text-xl text-carbon">{acceso.titulo}</h2>
                      <p className="mt-1 text-sm text-piedra">{acceso.descripcion}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
