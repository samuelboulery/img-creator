/**
 * Marque une image dont seule la vignette a survécu au rechargement : le budget
 * localStorage n'a pas pu garder sa pleine résolution.
 */
export default function PreviewBadge() {
  return (
    <span
      title="l'image pleine résolution n'a pas tenu dans le stockage local — il reste l'aperçu"
      className="rounded-pill bg-app/60 px-2 py-[5px] font-mono text-[10.5px] text-meta backdrop-blur-[10px]"
    >
      aperçu
    </span>
  )
}
