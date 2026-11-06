import { Navigate, useLocation } from "react-router";
import { useAuth } from "~/hooks/use-auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vinotinto-suave/40">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-vinotinto/20 border-t-vinotinto" />
          <p className="text-sm text-piedra">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/acceso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
