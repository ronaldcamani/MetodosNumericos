import katex from 'katex'
import 'katex/dist/katex.min.css'

/** Fórmulas LaTeX escritas por nosotros (nunca por el usuario). */
export default function Matematica({ tex, bloque = false }: { tex: string; bloque?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: bloque, throwOnError: false })
  return <span className={bloque ? 'formula-bloque' : undefined} dangerouslySetInnerHTML={{ __html: html }} />
}
