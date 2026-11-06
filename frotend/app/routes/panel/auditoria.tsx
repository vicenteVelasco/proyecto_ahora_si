import type { Route } from "./+types/auditoria";
import { useEffect, useState } from "react";
import PanelLayout from "~/components/layout/panel-layout";
import { auditoriaService } from "~/../src/services/auditoria.service";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Auditoría - Panel" }];
}

export default function Auditoria() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    try { setRegistros(await auditoriaService.getAll()); } catch (e: any) { setError(e?.response?.data?.detail || "Error al cargar auditoría"); } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);

  return (
    <PanelLayout>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl text-carbon">Auditoría</h1>
        <p className="mt-1 text-piedra">Registro de acciones realizadas en el sistema</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-piedra-clara bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-vinotinto-suave/40">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-carbon">Fecha/Hora</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Usuario ID</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Acción</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">Tabla</th>
                <th className="px-6 py-3 text-left font-medium text-carbon">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Cargando...</td></tr> : error ? <tr><td colSpan={5} className="px-6 py-8 text-center text-red-600">{error}</td></tr> : registros.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-piedra">Sin registros</td></tr> : registros.map((r) => (
                <tr key={r.id} className="border-t border-piedra-clara/60">
                  <td className="px-6 py-3">{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString() : "-"}</td>
                  <td className="px-6 py-3">{r.persona_id}</td>
                  <td className="px-6 py-3">{r.accion}</td>
                  <td className="px-6 py-3">{r.tabla_afectada}</td>
                  <td className="px-6 py-3">{r.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PanelLayout>
  );
}
