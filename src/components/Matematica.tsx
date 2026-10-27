import katex from 'katex'
import 'katex/dist/katex.min.css'

/** Fórmulas LaTeX escritas por nosotros (nunca por el usuario). */
export default function Matematica({ tex, bloque = false }: { tex: string; bloque?: boolean }) {
  const html = katex.renderToString(tex, { displayMode: bloque, throwOnError: false })
  // Las fórmulas en bloque pueden desbordar en pantallas estrechas: se pueden enfocar para desplazarlas con el teclado.
  return <span className={bloque ? 'formula-bloque' : undefined} tabIndex={bloque ? 0 : undefined} dangerouslySetInnerHTML={{ __html: html }} />
}
