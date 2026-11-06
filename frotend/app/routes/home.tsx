import { useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NivelCard from "../components/NivelCard";
import Carrusel from "../components/Carrusel";
import BotonSubir from "../components/BotonSubir";
import VisorImagen from "../components/VisorImagen";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Unidad Educativa Peribeca" },
    {
      name: "description",
      content: "Sistema de gestión escolar del Liceo Peribeca: notas, horarios y más.",
    },
  ];
}

const DIAPOSITIVAS_HERO = [
  {
    src: "/imagenes/fachada-aulas.jpg",
    alt: "Fachada de una de las aulas de la Unidad Educativa Peribeca, decorada con motivos escolares",
  },
  {
    src: "/imagenes/mural-proceres.jpg",
    alt: "Mural con próceres de la independencia en uno de los pasillos de la institución",
  },
];

const NIVELES = [
  {
    titulo: "Primaria",
    rango: "1er a 6to grado",
    descripcion:
      "Los primeros pasos de la formación académica, con acompañamiento cercano en cada grado.",
    imagenUrl: "/imagenes/cartelera-mundial.jpg",
  },
  {
    titulo: "Secundaria",
    rango: "1er a 3er año",
    descripcion: "Ciclo básico donde el estudiante profundiza en las áreas del conocimiento.",
    imagenUrl: "/imagenes/entrada-cen-1947-lateral.jpg",
  },
  {
    titulo: "Bachillerato",
    rango: "4to y 5to año",
    descripcion: "Ciclo diversificado que prepara al estudiante para la educación superior.",
    imagenUrl: "/imagenes/mural-proceres.jpg",
  },
];

const DIAPOSITIVAS_GALERIA = [
  {
    src: "/imagenes/entrada-cen-1947-frontal.jpg",
    alt: "Entrada principal de la institución, con el letrero original C.E.N. Peribeca 1947",
    leyenda: "Entrada principal, con el letrero original de 1947.",
  },
  {
    src: "/imagenes/fachada-aulas.jpg",
    alt: "Fachada de una de las aulas de la institución",
    leyenda: "Una de las aulas de la institución.",
  },
  {
    src: "/imagenes/cartelera-mundial.jpg",
    alt: "Cartelera elaborada por los estudiantes",
    leyenda: "Carteleras elaboradas por los estudiantes.",
  },
  {
    src: "/imagenes/mural-proceres.jpg",
    alt: "Mural con próceres de la independencia",
    leyenda: "Mural con próceres de la independencia.",
  },
  {
    src: "/imagenes/entrada-cen-1947-lateral.jpg",
    alt: "Vista lateral de la entrada principal de la institución",
    leyenda: "Vista lateral de la entrada principal.",
  },
];

function RayaDorada({ className = "" }: { className?: string }) {
  return <span className={`mt-3 block h-1 w-12 rounded-full bg-dorado ${className}`} />;
}

export default function Home() {
  const [indiceVisor, setIndiceVisor] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-vinotinto-suave/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-medium text-vinotinto">Desde 1947</p>
            <h1 className="mt-3 font-titulo text-4xl leading-tight text-carbon md:text-5xl">
              Unidad Educativa Peribeca
            </h1>
            <p className="mt-5 max-w-md text-piedra">
              Formamos estudiantes de primaria, secundaria y bachillerato en el
              municipio Independencia del estado Táchira.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/acceso"
                viewTransition
                className="rounded-full bg-gradient-to-r from-vinotinto to-vinotinto-oscuro px-6 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-lg hover:shadow-vinotinto/30"
              >
                Ingresar al sistema
              </Link>
              <a
                href="#historia"
                className="rounded-full border border-piedra-clara px-6 py-3 text-sm font-medium text-carbon transition hover:scale-105 hover:border-vinotinto hover:text-vinotinto"
              >
                Conocer nuestra historia
              </a>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -right-4 -top-4 hidden h-full w-full rounded-3xl bg-gradient-to-br from-vinotinto to-dorado md:block"
            />
            <div className="relative">
              <Carrusel diapositivas={DIAPOSITIVAS_HERO} retrasoAutoplayMs={6000} />
            </div>
          </div>
        </div>
      </section>

      <section id="historia" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div className="group overflow-hidden rounded-3xl">
            <img
              src="/imagenes/entrada-cen-1947-frontal.jpg"
              alt="Entrada principal de la institución, con el letrero original C.E.N. Peribeca 1947"
              className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-[26rem]"
            />
          </div>

          <div>
            <p className="bg-gradient-to-r from-vinotinto to-dorado bg-clip-text font-titulo text-7xl text-transparent">
              1947
            </p>
            <h2 className="mt-2 font-titulo text-3xl text-carbon">
              Una historia que empezó en Peribeca
            </h2>
            <RayaDorada />
            <p className="mt-4 text-piedra">
              La institución nació como la Escuela Federal Graduada "Ramón
              Buenahora" en Capacho. Ese mismo año, gracias a las gestiones del
              profesor Florencio Chacón, se trasladó hacia Peribeca, en un
              terreno adquirido a don Antonio Ureña. Las clases comenzaron el
              16 de septiembre de 1947 con cuatro aulas para los seis grados
              de primaria, bajo la dirección del profesor Manuel Osorio
              Velasco.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-titulo text-lg text-carbon">Misión</h3>
                <p className="mt-2 text-sm text-piedra">
                  Acompañar el desarrollo académico, personal y de valores de
                  cada estudiante, impulsando proyectos que unen a la escuela,
                  la familia y la comunidad.
                </p>
              </div>
              <div>
                <h3 className="font-titulo text-lg text-carbon">Visión</h3>
                <p className="mt-2 text-sm text-piedra">
                  Ser un centro educativo de referencia en Táchira, reconocido
                  por su compromiso con la formación integral y el arraigo
                  con su entorno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="niveles" className="scroll-mt-20 bg-vinotinto-suave/40 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-titulo text-3xl text-carbon">Niveles educativos</h2>
          <RayaDorada />
          <p className="mt-4 max-w-xl text-piedra">
            Acompañamos a cada estudiante desde primaria hasta la culminación
            del bachillerato.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NIVELES.map((nivel) => (
              <NivelCard key={nivel.titulo} {...nivel} />
            ))}
          </div>
        </div>
      </section>

      <section id="galeria" className="scroll-mt-20 bg-vinotinto-suave py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-titulo text-3xl text-carbon">Galería</h2>
          <RayaDorada />
          <p className="mt-4 max-w-xl text-piedra">
            Un vistazo a nuestras instalaciones. Haz clic en cualquier foto
            para verla en grande. Pronto sumaremos más fotografías aquí.
          </p>

          <div className="mt-10">
            <Carrusel
              diapositivas={DIAPOSITIVAS_GALERIA}
              anchoDiapositiva="flex-[0_0_85%] sm:flex-[0_0_60%] lg:flex-[0_0_42%]"
              alturaImagen="h-56 md:h-72"
              retrasoAutoplayMs={4500}
              alHacerClicDiapositiva={setIndiceVisor}
            />
          </div>
        </div>
      </section>

      <Footer />
      <BotonSubir />

      {indiceVisor !== null && (
        <VisorImagen
          diapositivas={DIAPOSITIVAS_GALERIA}
          indiceActivo={indiceVisor}
          onCerrar={() => setIndiceVisor(null)}
          onCambiarIndice={setIndiceVisor}
        />
      )}
    </div>
  );
}
