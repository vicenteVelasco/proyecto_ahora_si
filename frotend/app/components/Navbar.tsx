import { useEffect, useState } from "react";
import { Link } from "react-router";
import { LogIn, Menu, X } from "lucide-react";

const ENLACES_SECCIONES = [
  { etiqueta: "Historia", destino: "/#historia" },
  { etiqueta: "Niveles", destino: "/#niveles" },
  { etiqueta: "Galería", destino: "/#galeria" },
  { etiqueta: "Contacto", destino: "/#contacto" },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [conScroll, setConScroll] = useState(false);

  useEffect(() => {
    function alHacerScroll() {
      setConScroll(window.scrollY > 8);
    }
    alHacerScroll();
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 bg-vinotinto-suave/80 backdrop-blur transition-shadow duration-300 ${
        conScroll ? "shadow-md shadow-carbon/10" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" viewTransition className="flex items-center gap-3">
          <img
            src="/imagenes/escudo-cen-peribeca.png"
            alt="Escudo de la Unidad Educativa Peribeca"
            className="h-11 w-11 object-contain"
          />
          <span className="font-titulo text-xl font-semibold tracking-tight text-vinotinto">
            Unidad Educativa Peribeca
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-carbon md:flex">
          {ENLACES_SECCIONES.map((enlace) => (
            <a
              key={enlace.destino}
              href={enlace.destino}
              className="relative py-1 transition hover:text-vinotinto after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-dorado after:transition-all after:duration-300 hover:after:w-full"
            >
              {enlace.etiqueta}
            </a>
          ))}
        </nav>

        <Link
          to="/acceso"
          viewTransition
          className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-vinotinto to-vinotinto-oscuro px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:scale-105 hover:shadow-lg hover:shadow-vinotinto/30 md:inline-flex"
        >
          <LogIn className="h-4 w-4" />
          Acceso
        </Link>

        <button
          type="button"
          onClick={() => setMenuAbierto((valor) => !valor)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          className="rounded-lg p-1 text-carbon transition hover:bg-white/70 hover:text-vinotinto md:hidden"
        >
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto && (
        <nav className="flex flex-col gap-4 border-t border-piedra-clara px-6 py-6 text-sm text-carbon md:hidden">
          {ENLACES_SECCIONES.map((enlace) => (
            <a
              key={enlace.destino}
              href={enlace.destino}
              onClick={() => setMenuAbierto(false)}
              className="hover:text-vinotinto"
            >
              {enlace.etiqueta}
            </a>
          ))}
          <Link
            to="/acceso"
            viewTransition
            onClick={() => setMenuAbierto(false)}
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-vinotinto to-vinotinto-oscuro px-5 py-2 font-medium text-white transition hover:shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            Acceso
          </Link>
        </nav>
      )}
    </header>
  );
}
