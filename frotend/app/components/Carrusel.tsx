import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

type Diapositiva = {
  src: string;
  alt: string;
  leyenda?: string;
};

type PropsCarrusel = {
  diapositivas: Diapositiva[];
  anchoDiapositiva?: string;
  alturaImagen?: string;
  retrasoAutoplayMs?: number;
  alHacerClicDiapositiva?: (indice: number) => void;
};

const prefiereMovimientoReducido = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Carrusel({
  diapositivas,
  anchoDiapositiva = "flex-[0_0_100%]",
  alturaImagen = "h-72 md:h-96",
  retrasoAutoplayMs = 5000,
  alHacerClicDiapositiva,
}: PropsCarrusel) {
  const plugins = prefiereMovimientoReducido()
    ? []
    : [Autoplay({ delay: retrasoAutoplayMs, stopOnInteraction: false, stopOnMouseEnter: true })];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, plugins);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [totalDiapositivas, setTotalDiapositivas] = useState(0);

  const alSeleccionar = useCallback(() => {
    if (!emblaApi) return;
    setIndiceActivo(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setTotalDiapositivas(emblaApi.scrollSnapList().length);
    emblaApi.on("select", alSeleccionar);
    alSeleccionar();
    return () => {
      emblaApi.off("select", alSeleccionar);
    };
  }, [emblaApi, alSeleccionar]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
        <div className="flex cursor-grab touch-pan-y active:cursor-grabbing">
          {diapositivas.map((diapositiva, indice) => (
            <div key={diapositiva.src} className={`min-w-0 ${anchoDiapositiva} px-2`}>
              <figure
                onClick={() => alHacerClicDiapositiva?.(indice)}
                onKeyDown={(evento) => {
                  if (!alHacerClicDiapositiva) return;
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alHacerClicDiapositiva(indice);
                  }
                }}
                role={alHacerClicDiapositiva ? "button" : undefined}
                tabIndex={alHacerClicDiapositiva ? 0 : undefined}
                aria-label={alHacerClicDiapositiva ? `Ver en grande: ${diapositiva.alt}` : undefined}
                className={`group/figura relative overflow-hidden rounded-2xl ${
                  alHacerClicDiapositiva
                    ? "cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-dorado"
                    : ""
                }`}
              >
                <img
                  src={diapositiva.src}
                  alt={diapositiva.alt}
                  loading="lazy"
                  draggable={false}
                  className={`w-full select-none object-cover transition-transform duration-500 ${
                    alHacerClicDiapositiva ? "group-hover/figura:scale-105" : ""
                  } ${alturaImagen}`}
                />
                {alHacerClicDiapositiva && (
                  <span className="absolute inset-0 flex items-center justify-center bg-carbon/0 opacity-0 transition-all duration-300 group-hover/figura:bg-carbon/30 group-hover/figura:opacity-100">
                    <span className="rounded-full bg-white/90 p-2 text-carbon">
                      <Expand className="h-5 w-5" />
                    </span>
                  </span>
                )}
                {diapositiva.leyenda && (
                  <figcaption className="mt-2 text-sm text-piedra">{diapositiva.leyenda}</figcaption>
                )}
              </figure>
            </div>
          ))}
        </div>
      </div>

      {diapositivas.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Diapositiva anterior"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-vinotinto/90 text-white shadow-lg backdrop-blur transition hover:scale-110 hover:bg-vinotinto-oscuro focus-visible:outline focus-visible:outline-2 focus-visible:outline-dorado"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente diapositiva"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-vinotinto/90 text-white shadow-lg backdrop-blur transition hover:scale-110 hover:bg-vinotinto-oscuro focus-visible:outline focus-visible:outline-2 focus-visible:outline-dorado"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalDiapositivas }).map((_, indice) => (
              <button
                key={indice}
                type="button"
                aria-label={`Ir a la diapositiva ${indice + 1}`}
                onClick={() => emblaApi?.scrollTo(indice)}
                className={`h-2 rounded-full transition-all ${
                  indice === indiceActivo ? "w-6 bg-vinotinto" : "w-2 bg-piedra-clara"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
