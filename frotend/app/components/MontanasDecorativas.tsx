type PropsMontanas = {
  className?: string;
};

export default function MontanasDecorativas({ className = "" }: PropsMontanas) {
  return (
    <svg viewBox="0 0 300 80" className={`w-full ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M0 80 L45 25 L80 55 L120 10 L160 50 L200 20 L240 60 L300 15 L300 80 Z"
      />
    </svg>
  );
}
