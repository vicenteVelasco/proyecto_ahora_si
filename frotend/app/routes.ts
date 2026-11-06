import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("acceso", "routes/acceso.tsx"),
  layout("routes/panel.tsx", [
    route("panel", "routes/panel-inicio.tsx"),
    route("estudiante/notas", "routes/estudiante-notas.tsx"),
    route("estudiante/horario", "routes/estudiante-horario.tsx"),
  ]),
] satisfies RouteConfig;
