import { useMemo, useState } from 'react'
import Matematica from '../../components/Matematica'
import { fmt } from '../../core/formato'
import {
  analizarConvergenciaBiseccion,
  analizarConvergenciaFalsa,
  analizarConvergenciaNewton,
  analizarConvergenciaPuntoFijo,
  analizarConvergenciaSecante,
  biseccion,
  crearModelo,
  crearModeloPolinomio,
  falsaPosicion,
  FICHAS_CONVERGENCIA,
  MODELOS_PUNTO_FIJO,
  newton,
  puntoFijo,
  secante,
  type AnalisisConvergencia,
  type FichaConvergencia,
  type MetodoConvergencia,
} from '../../core/m1'

const M = Matematica

function claseBadge(orden: number, familia: FichaConvergencia['familia']): string {
  if (familia === 'cerrado' || orden <= 1.15) return 'conv-badge conv-badge-lineal'
  if (orden < 1.85) return 'conv-badge conv-badge-superlineal'
  return 'conv-badge conv-badge-cuadratica'
}

function pctMedidor(p: number): number {
  return Math.max(4, Math.min(100, (p / 2.2) * 100))
}

/** Indicador compacto del orden p estimado y alertas de convergencia tras una ejecución. */
export function PanelConvergenciaEjecucion({ analisis }: { analisis: AnalisisConvergencia }) {
  const { ficha, ordenTeorico, ordenEmpirico, factorAsintotico, razonLineal, clasificacion, resumen, alertas } = analisis
  const pVisual = ordenEmpirico ?? ordenTeorico
  return (
    <section className="conv-panel" aria-label={`Análisis de convergencia de ${ficha.nombre}`}>
      <div className="conv-panel-cabecera">
        <h4>Análisis y criterios de convergencia · {ficha.nombre}</h4>
        <span className={claseBadge(pVisual, ficha.familia)}>
          <span className="conv-badge-punto" aria-hidden="true" />
          {clasificacion}
        </span>
      </div>
      <p className="conv-resumen">{resumen}</p>

      <div className="conv-medidor" aria-hidden="true">
        <div className="conv-medidor-barra">
          <div className="conv-medidor-relleno" style={{ width: `${pctMedidor(pVisual)}%` }} />
          <span className="conv-marca" style={{ left: `${pctMedidor(1)}%` }} title="Lineal p = 1">p=1</span>
          <span className="conv-marca" style={{ left: `${pctMedidor(1.618)}%` }} title="Secante p ≈ 1.62">φ≈1.62</span>
          <span className="conv-marca" style={{ left: `${pctMedidor(2)}%` }} title="Cuadrático p = 2">p=2</span>
        </div>
      </div>

      <dl className="resumen">
        <dt>Orden teórico</dt>
        <dd>{ficha.ordenEtiqueta}</dd>
        <dt>Orden empírico estimado p</dt>
        <dd>{ordenEmpirico !== null ? fmt(ordenEmpirico, 3) : 'Se requieren ≥ 3 iteraciones útiles'}</dd>
        <dt>Factor asintótico C</dt>
        <dd>{factorAsintotico !== null ? fmt(factorAsintotico, 4) : '—'}</dd>
        {razonLineal !== null && (
          <>
            <dt>Última razón |Δxₖ / Δxₖ₋₁|</dt>
            <dd>{fmt(razonLineal, 4)}</dd>
          </>
        )}
        <dt>Condición matemática</dt>
        <dd><M tex={ficha.condicionTex} /></dd>
      </dl>

      {alertas.length > 0 && (
        <ul className="conv-alertas">
          {alertas.map((a) => (
            <li key={a}>⚠ {a}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Ficha de convergencia informativa (p. ej. para métodos polinómicos sin iteración única). */
export function PanelFichaConvergencia({ metodo }: { metodo: MetodoConvergencia }) {
  const f = FICHAS_CONVERGENCIA[metodo]
  return (
    <section className="conv-panel" aria-label={`Criterio de convergencia de ${f.nombre}`}>
      <div className="conv-panel-cabecera">
        <h4>Criterio de convergencia · {f.nombre}</h4>
        <span className={claseBadge(f.ordenTeorico, f.familia)}>
          <span className="conv-badge-punto" aria-hidden="true" />
          {f.ordenEtiqueta}
        </span>
      </div>
      <p><M tex={f.formulaOrdenTex} /></p>
      <p>{f.velocidadResumen}</p>
      <p className="suave"><strong>Riesgo principal:</strong> {f.riesgoPrincipal}</p>
    </section>
  )
}

type IdEscenario = 'simple' | 'doble' | 'estancamiento'

const ESCENARIOS: Record<IdEscenario, { titulo: string; descripcion: string }> = {
  simple: {
    titulo: 'Raíz simple: x³ − x − 2',
    descripcion: 'Newton desde x₀ = 1.5 alcanza orden cuadrático p ≈ 2; Secante en (1, 2) muestra orden superlineal ≈ 1.62; Punto Fijo con g(x)=∛(x+2) converge linealmente con razón |g′(r)| ≈ 0.144; Bisección mantiene p = 1.',
  },
  doble: {
    titulo: 'Raíz doble: (x − 1)²(x − 2)',
    descripcion: 'En x = 1 se anulan f y f′ a la vez: la bisección en [0.5, 1.5] ni siquiera ve cambio de signo, y Newton desde 0.5 se degrada de p = 2 a convergencia lineal (p ≈ 1).',
  },
  estancamiento: {
    titulo: 'Curvatura alta: x⁶ − 1 en [0, 1.5]',
    descripcion: 'La falsa posición deja fijo b = 1.5 en los 43 pasos y se frena por debajo de la bisección; Newton desde 1.5 sigue siendo cuadrático.',
  },
}

const ORDEN_FICHAS: MetodoConvergencia[] = ['newton', 'secante', 'punto_fijo', 'polinomio', 'biseccion', 'falsa']

/** Sección interactiva "Análisis y Criterios de Convergencia" para métodos abiertos vs cerrados. */
export function SeccionConvergenciaAbiertos() {
  const [escenario, setEscenario] = useState<IdEscenario>('simple')

  const resultados = useMemo<AnalisisConvergencia[]>(() => {
    if (escenario === 'doble') {
      const m = crearModeloPolinomio([1, -4, 5, -2])
      return [
        analizarConvergenciaNewton(newton({ f: m.f, df: m.df, x0: 0.5, tol: 1e-8, maxIter: 120 })),
        analizarConvergenciaSecante(secante({ f: m.f, x0: 0.4, x1: 0.6, tol: 1e-8, maxIter: 120 })),
        analizarConvergenciaBiseccion(biseccion({ f: m.f, a: 0.5, b: 1.5, tol: 1e-8, maxIter: 120 })),
        analizarConvergenciaFalsa(falsaPosicion({ f: m.f, a: 0.5, b: 1.5, tol: 1e-8, maxIter: 120 })),
      ]
    }
    if (escenario === 'estancamiento') {
      const m = crearModeloPolinomio([1, 0, 0, 0, 0, 0, -1])
      return [
        analizarConvergenciaNewton(newton({ f: m.f, df: m.df, x0: 1.5, tol: 1e-6, maxIter: 100 })),
        analizarConvergenciaSecante(secante({ f: m.f, x0: 0.5, x1: 1.5, tol: 1e-6, maxIter: 100 })),
        analizarConvergenciaBiseccion(biseccion({ f: m.f, a: 0, b: 1.5, tol: 1e-6, maxIter: 200 })),
        analizarConvergenciaFalsa(falsaPosicion({ f: m.f, a: 0, b: 1.5, tol: 1e-6, maxIter: 200 })),
      ]
    }
    const base = crearModelo('calibracion', 2)
    const pf = MODELOS_PUNTO_FIJO.calibracion_cbrt
    return [
      analizarConvergenciaNewton(newton({ f: base.f, df: base.df, x0: 1.5, tol: 1e-6, maxIter: 100 })),
      analizarConvergenciaSecante(secante({ f: base.f, x0: 1, x1: 2, tol: 1e-6, maxIter: 100 })),
      analizarConvergenciaPuntoFijo(puntoFijo({ g: pf.g, dg: pf.dg, x0: pf.x0Sugerido, tol: 1e-6, maxIter: 100 })),
      analizarConvergenciaBiseccion(biseccion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 })),
      analizarConvergenciaFalsa(falsaPosicion({ f: base.f, a: 1, b: 2, tol: 1e-6, maxIter: 100 })),
    ]
  }, [escenario])

  return (
    <div className="conv-seccion">
      <h2 id="h-conv">Análisis y Criterios de Convergencia</h2>
      <p>
        Cada método abierto converge —o falla— de manera distinta según cuánta información local de la función utiliza
        y qué tan cerca esté el punto inicial de la raíz. La velocidad asintótica se mide mediante el{' '}
        <strong>orden de convergencia <M tex="p" /></strong> a partir de los últimos cambios{' '}
        <M tex="|\Delta x_k|=|x_{k+1}-x_k|" />:
      </p>
      <M bloque tex="p \approx \frac{\ln\!\left(|\Delta x_k|/|\Delta x_{k-1}|\right)}{\ln\!\left(|\Delta x_{k-1}|/|\Delta x_{k-2}|\right)}, \qquad C \approx \frac{|\Delta x_k|}{|\Delta x_{k-1}|^p}" />

      <div className="conv-grid">
        {ORDEN_FICHAS.map((id) => {
          const f = FICHAS_CONVERGENCIA[id]
          return (
            <article key={id} className="conv-tarjeta" data-familia={f.familia}>
              <div className="conv-tarjeta-top">
                <h3>{f.nombre}</h3>
                <span className={claseBadge(f.ordenTeorico, f.familia)}>
                  <span className="conv-badge-punto" aria-hidden="true" />
                  {f.ordenEtiqueta}
                </span>
              </div>
              <p className="conv-familia">Familia: <strong>{f.familia}</strong></p>
              <p className="conv-formula"><M tex={f.formulaOrdenTex} /></p>
              <p><strong>Condición suficiente:</strong> <M tex={f.condicionTex} /></p>
              <p><strong>Velocidad:</strong> {f.velocidadResumen}</p>
              <p><strong>Riesgo principal:</strong> {f.riesgoPrincipal}</p>
            </article>
          )
        })}
      </div>

      <div className="conv-lab">
        <h3>Experimento interactivo: compara el orden empírico <M tex="p" /></h3>
        <p>Selecciona un escenario para observar cómo cambia el orden de convergencia en ejecución real:</p>
        <div className="acciones" role="group" aria-label="Escenarios de convergencia">
          {(Object.keys(ESCENARIOS) as IdEscenario[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={escenario === id}
              className={escenario === id ? 'btn-activo' : undefined}
              onClick={() => setEscenario(id)}
            >
              {ESCENARIOS[id].titulo}
            </button>
          ))}
        </div>
        <p className="aviso">{ESCENARIOS[escenario].descripcion}</p>
        <div className="conv-lab-resultados">
          {resultados.map((an) => (
            <PanelConvergenciaEjecucion key={an.metodo} analisis={an} />
          ))}
        </div>
      </div>
    </div>
  )
}
