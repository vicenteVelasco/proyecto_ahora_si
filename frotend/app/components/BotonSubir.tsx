import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const UMBRAL_SCROLL_PX = 480;

export default function BotonSubir() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function alHacerScroll() {
      setVisible(window.scrollY > UMBRAL_SCROLL_PX);
    }
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, []);

  function subirArriba() {
    const comportamiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior: comportamiento });
  }

  return (
    <button
      type="button"
      onClick={subirArriba}
      aria-label="Volver arriba"
      className={`fixed bottom-6 right-6 z-20 rounded-full bg-vinotinto p-3 text-white shadow-lg transition-all duration-300 hover:bg-vinotinto-oscuro hover:scale-110 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
