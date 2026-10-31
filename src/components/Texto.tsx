import Matematica from './Matematica'

/** Texto con `$fórmula$` y `**negrita**` (los problemas generados se describen como texto plano). */
export default function Texto({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('**').map((trozo, i) => {
        const partes = trozo.split('$').map((p, k) => (k % 2 ? <Matematica key={k} tex={p} /> : p))
        return i % 2 ? <strong key={i}>{partes}</strong> : <span key={i}>{partes}</span>
      })}
    </>
  )
}
