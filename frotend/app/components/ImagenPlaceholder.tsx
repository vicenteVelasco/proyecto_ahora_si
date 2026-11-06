import { useId } from "react";

type Props = {
  /** Texto que identifica el bloque, p. ej. "Nivel Primaria". */
  titulo: string;
  /** Pie de foto opcional. */
  detalle?: string;
  className?: string;
};

/**
 * Marcador de imagen con identidad institucional.
 *
 * Sustituir por la fotografía real cuando la institución la facilite:
 * cambia el <div> de este componente por una <img src="..." alt="..." />.
 * No se usa ninguna imagen externa para no depender de terceros.
 */
export function ImagenPlaceholder({ titulo, detalle, className = "" }: Props) {
  const patron = useId();

  return (
    <div
      className={`relative isolate overflow-hidden bg-vino-900 ${className}`}
      role="img"
      aria-label={`Marcador de imagen: ${titulo}`}
    >
      <svg aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full">
        <defs>
          <pattern
            id={patron}
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="16" stroke="white" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patron})`} opacity="0.12" />
      </svg>

      <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center text-white">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mb-2 h-7 w-7 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 8.5 8.5 3l3 3 4-4 5.5 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5Z" />
          <path d="M3 15.5 8 11l4 3.5 3-2.5 6 5" />
        </svg>
        <p className="font-display text-sm font-semibold tracking-tight">{titulo}</p>
        {detalle ? <p className="text-xs text-white/70">{detalle}</p> : null}
      </div>
    </div>
  );
}
