import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type DiapositivaVisor = {
  src: string;
  alt: string;
  leyenda?: string;
};

type PropsVisorImagen = {
  diapositivas: DiapositivaVisor[];
  indiceActivo: number;
  onCerrar: () => void;
  onCambiarIndice: (indice: number) => void;
};

export default function VisorImagen({
  diapositivas,
  indiceActivo,
  onCerrar,
  onCambiarIndice,
}: PropsVisorImagen) {
  const diapositiva = diapositivas[indiceActivo];
  const total = diapositivas.length;

  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
      if (evento.key === "ArrowRight") onCambiarIndice((indiceActivo + 1) % total);
      if (evento.key === "ArrowLeft") onCambiarIndice((indiceActivo - 1 + total) % total);
    }

    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [indiceActivo, total, onCerrar, onCambiarIndice]);

  if (!diapositiva) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={diapositiva.alt}
      onClick={onCerrar}
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/95 px-4 py-10 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-dorado"
      >
        <X className="h-7 w-7" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              onCambiarIndice((indiceActivo - 1 + total) % total);
            }}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-dorado md:left-6"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation();
              onCambiarIndice((indiceActivo + 1) % total);
            }}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-dorado md:right-6"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      <figure
        onClick={(evento) => evento.stopPropagation()}
        className="flex max-h-full max-w-4xl flex-col items-center"
      >
        <img
          src={diapositiva.src}
          alt={diapositiva.alt}
          className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
        />
        {diapositiva.leyenda && (
          <figcaption className="mt-4 text-center text-sm text-white/70">
            {diapositiva.leyenda}
          </figcaption>
        )}
        {total > 1 && (
          <p className="mt-2 text-center text-xs text-white/40">
            {indiceActivo + 1} / {total}
          </p>
        )}
      </figure>
    </div>
  );
}
