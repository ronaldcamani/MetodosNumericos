import { NIVELES, ROTULO_NIVEL } from '../core/practica/base'
import { POR_ESTRELLA, MAX_ESTRELLAS, dominio, estrellas, etiquetaDominio } from '../core/practica/progreso'
import Estrellas from './Estrellas'
import { useProgreso } from './useProgreso'

/** Indicador de avance y dominio del tema: puntos, estrellas por nivel y barra de dominio. */
export default function ProgresoTema({ tema }: { tema: string }) {
  const { progreso: p } = useProgreso(tema)
  const pct = dominio(p)
  return (
    <section className="progreso" aria-label="Tu progreso en este tema">
      <p className="progreso-resumen">
        <strong>{etiquetaDominio(pct)}</strong> · dominio {pct} % · {p.puntos} puntos
        {p.estudiados.length > 0 && <> · {p.estudiados.length} {p.estudiados.length === 1 ? 'ejemplo estudiado' : 'ejemplos estudiados'}</>}
      </p>
      <div className="barra" role="progressbar" aria-label="Dominio del tema" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <ul className="progreso-niveles">
        {NIVELES.map((n) => (
          <li key={n}>
            {ROTULO_NIVEL[n]} <Estrellas n={estrellas(p.correctas[n])} /> <span className="suave">{p.correctas[n]} resueltos{estrellas(p.correctas[n]) < MAX_ESTRELLAS ? ` · próxima estrella a los ${(estrellas(p.correctas[n]) + 1) * POR_ESTRELLA}` : ''}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
