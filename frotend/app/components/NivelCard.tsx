type PropsNivelCard = {
  titulo: string;
  rango: string;
  descripcion: string;
  imagenUrl: string;
};

export default function NivelCard({ titulo, rango, descripcion, imagenUrl }: PropsNivelCard) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-piedra-clara bg-white transition-all duration-300 hover:-translate-y-1 hover:border-vinotinto/40 hover:shadow-xl hover:shadow-vinotinto/10">
      <div className="overflow-hidden">
        <img
          src={imagenUrl}
          alt={`Fotografía del nivel de ${titulo} en la institución`}
          loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <p className="inline-block rounded-full border border-dorado/40 bg-dorado-suave px-3 py-1 text-xs font-medium uppercase tracking-wide text-vinotinto">
          {rango}
        </p>
        <h3 className="mt-3 font-titulo text-xl text-carbon">{titulo}</h3>
        <p className="mt-2 text-sm leading-relaxed text-piedra">{descripcion}</p>
      </div>
    </article>
  );
}
