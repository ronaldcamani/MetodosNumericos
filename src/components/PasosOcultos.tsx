import { useEffect, useRef, useState } from 'react'

/** Desarrollo en tarjetas escondidas: el estudiante las revela una a una, o todas, y puede volver a ocultarlas. */
export default function PasosOcultos({ pasos, nombre, alCompletar }: { pasos: React.ReactNode[]; nombre: string; alCompletar?: () => void }) {
  const [n, setN] = useState(0)
  const ultimo = useRef<HTMLLIElement>(null)
  const volver = useRef<HTMLButtonElement>(null)
  const siguiente = useRef<HTMLButtonElement>(null)
  const montado = useRef(false)
  const completo = n >= pasos.length

  useEffect(() => {
    if (!montado.current) { montado.current = true; return }
    // El foco sigue al contenido nuevo; al terminar, pasa al botón que sigue disponible.
    if (n >= pasos.length) volver.current?.focus()
    else if (n > 0) ultimo.current?.focus()
    else siguiente.current?.focus()
    if (n >= pasos.length) alCompletar?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  return (
    <div className="pasos-ocultos">
      <ol className="pasos" aria-label={`Desarrollo paso a paso: ${nombre}`}>
        {pasos.map((p, i) =>
          i < n ? (
            <li key={i} className="paso paso-visible" ref={i === n - 1 ? ultimo : undefined} tabIndex={-1}>
              <span className="paso-numero">Paso {i + 1}</span>
              <div>{p}</div>
            </li>
          ) : (
            <li key={i} className="paso paso-oculto" aria-hidden="true">
              <span className="paso-numero">Paso {i + 1}</span>
              <span className="paso-candado">oculto</span>
            </li>
          ),
        )}
      </ol>
      <div className="acciones">
        {!completo && (
          <>
            <button type="button" ref={siguiente} onClick={() => setN(n + 1)}>Mostrar siguiente paso ({n + 1} de {pasos.length})<span className="solo-lectura"> de {nombre}</span></button>
            <button type="button" onClick={() => setN(pasos.length)}>Mostrar todos los pasos<span className="solo-lectura"> de {nombre}</span></button>
          </>
        )}
        {n > 0 && (
          <button type="button" ref={volver} onClick={() => setN(0)}>Ocultar los pasos<span className="solo-lectura"> de {nombre}</span></button>
        )}
      </div>
    </div>
  )
}
