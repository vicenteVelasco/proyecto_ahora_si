const ANIO_ACTUAL = new Date().getFullYear();

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="scroll-mt-20 border-t border-piedra-clara bg-carbon text-piedra-clara"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/imagenes/escudo-cen-peribeca.png"
              alt="Escudo de la Unidad Educativa Peribeca"
              className="h-12 w-12 object-contain"
            />
            <p className="font-titulo text-lg text-white">Unidad Educativa Peribeca</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Calle principal de Bella Vista, frente a la Plaza Dr. Román Cárdenas,
            Municipio Independencia, Estado Táchira.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white">Niveles</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Educación Primaria</li>
            <li>Educación Secundaria</li>
            <li>Bachillerato</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white">Contacto</p>
          <p className="mt-3 text-sm leading-relaxed">
            Los datos de contacto directo se publicarán próximamente en esta sección.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs">
        © {ANIO_ACTUAL} Unidad Educativa Peribeca. Sistema de gestión escolar.
      </div>
    </footer>
  );
}
