import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import AppLayout from "~/components/layout/app-layout";
import ProtectedRoute from "~/components/auth/protected-route";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-piedra transition hover:text-vinotinto">
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
        </div>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}
