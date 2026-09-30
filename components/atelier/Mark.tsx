/**
 * Logo d'Obskura : les équerres de recadrage de screenmat, percées d'un
 * sténopé — le trou de la camera obscura.
 */
export default function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden className="shrink-0">
      <path
        d="M7 13V7h6M19 7h6v6M25 19v6h-6M13 25H7v-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="square"
      />
      <circle cx={16} cy={16} r={2.6} fill="currentColor" />
    </svg>
  )
}
