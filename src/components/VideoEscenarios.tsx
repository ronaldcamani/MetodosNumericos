import { useId } from 'react'
import { Easing, clamp, interpolate, progresoAFrame, spring } from '../core/animacionVideo'
import type { ModuloVideoId } from '../core/lecciones'

interface PropsEscenario {
  modulo: ModuloVideoId
  visual: string
  progreso: number
  duracion: number
  escenaIdx: number
  totalEscenas: number
}

const ANCHO = 960
const ALTO = 540

function fmtNum(v: number, dec = 2): string {
  return Number.isFinite(v) ? v.toFixed(dec) : '0'
}

function muestrearRuta(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  mapX: (x: number) => number,
  mapY: (y: number) => number,
  muestras = 80,
): string {
  const pts: string[] = []
  for (let i = 0; i <= muestras; i++) {
    const x = xMin + ((xMax - xMin) * i) / muestras
    const y = fn(x)
    const sx = mapX(x)
    const sy = mapY(y)
    pts.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`)
  }
  return pts.join(' ')
}

function factorial(n: number): number {
  let acc = 1
  for (let i = 2; i <= n; i++) acc *= i
  return acc
}

function taylorExp(x: number, terminos: number): number {
  let sum = 0
  for (let k = 0; k < terminos; k++) {
    sum += Math.pow(x, k) / factorial(k)
  }
  return sum
}

interface PropsSubEscenario {
  visual: string
  p: number
  frame: number
  glowUrl: string
}

function EscenarioErrores({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })

  if (visual === 'err-taylor') {
    const mapX = (x: number) => interpolate(x, [-1.2, 1.4], [115, 610])
    const mapY = (y: number) => interpolate(y, [0, 4.2], [440, 108])

    // Grado interpolado suavemente de n=1 a n=5 a lo largo de la escena
    const nCont = interpolate(p, [0.05, 0.85], [1, 5], { easing: Easing.easeOutCubic })
    const nBase = Math.min(4, Math.floor(nCont))
    const mezcla = nCont - nBase
    const nActual = Math.min(5, Math.round(nCont))

    const rutaExacta = muestrearRuta((x) => Math.exp(x), -1.2, 1.4, mapX, mapY, 90)
    const rutaTaylor = muestrearRuta(
      (x) => (1 - mezcla) * taylorExp(x, nBase) + mezcla * taylorExp(x, nBase + 1),
      -1.2,
      1.4,
      mapX,
      mapY,
      90,
    )

    const xUno = mapX(1)
    const yExacta1 = mapY(Math.E)
    const yApprox1 = mapY((1 - mezcla) * taylorExp(1, nBase) + mezcla * taylorExp(1, nBase + 1))
    const errVal = Math.abs(Math.E - ((1 - mezcla) * taylorExp(1, nBase) + mezcla * taylorExp(1, nBase + 1)))

    const terminosBarra = [1, 2, 3, 4, 5].map((n) => ({
      n,
      s: taylorExp(1, n),
      err: Math.abs(Math.E - taylorExp(1, n)),
    }))

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          Serie de Taylor de eˣ: plegado polinómico Sₙ(x) hacia eˣ
        </text>
        {/* Rejilla cartesiana */}
        {[-1, -0.5, 0, 0.5, 1].map((gx) => (
          <g key={gx}>
            <line x1={mapX(gx)} y1="108" x2={mapX(gx)} y2="440" stroke="#1e293b" strokeWidth="1" />
            <text x={mapX(gx)} y="462" fill="#94a3b8" fontSize="13" textAnchor="middle" fontFamily="monospace">
              {gx}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((gy) => (
          <g key={gy}>
            <line x1="115" y1={mapY(gy)} x2="610" y2={mapY(gy)} stroke="#1e293b" strokeWidth="1" />
            <text x="104" y={mapY(gy) + 4} fill="#94a3b8" fontSize="13" textAnchor="end" fontFamily="monospace">
              {gy}
            </text>
          </g>
        ))}
        <line x1="115" y1="440" x2="615" y2="440" stroke="#475569" strokeWidth="1.8" />
        <line x1={mapX(0)} y1="104" x2={mapX(0)} y2="440" stroke="#475569" strokeWidth="1.8" />

        {/* Curva exacta e^x */}
        <path d={rutaExacta} fill="none" stroke="#34d399" strokeWidth="3.2" filter={glowUrl} />
        {/* Polinomio S_n(x) */}
        <path d={rutaTaylor} fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeDasharray="8 4" />

        {/* Brecha de error en x = 1 */}
        <line x1={xUno} y1={yExacta1} x2={xUno} y2={yApprox1} stroke="#f59e0b" strokeWidth="3.5" />
        <circle cx={xUno} cy={yExacta1} r="6.5" fill="#34d399" />
        <circle cx={xUno} cy={yApprox1} r="6.5" fill="#38bdf8" />
        <rect x={xUno + 12} y={Math.min(yExacta1, yApprox1) - 10} width="166" height="46" rx="8" fill="#0f172a" stroke="#f59e0b" strokeOpacity="0.6" />
        <text x={xUno + 22} y={Math.min(yExacta1, yApprox1) + 10} fill="#fbbf24" fontSize="13" fontWeight="700" fontFamily="monospace">
          S_{nActual}(1) · |R|={fmtNum(errVal, 4)}
        </text>
        <text x={xUno + 22} y={Math.min(yExacta1, yApprox1) + 27} fill="#cbd5e1" fontSize="12" fontFamily="monospace">
          e¹ ≈ 2.7183
        </text>

        {/* Panel derecho: decaimiento de barras */}
        <rect x="652" y="108" width="252" height="332" rx="14" fill="#0b1324" stroke="#334155" />
        <text x="672" y="138" fill="#e2e8f0" fontSize="15" fontWeight="700">
          Error de truncamiento |e − Sₙ|
        </text>
        {terminosBarra.map((item, idx) => {
          const activo = nCont >= item.n - 0.15
          const yBarra = 176 + idx * 50
          const ancho = interpolate(item.err, [0, 1.8], [8, 165])
          return (
            <g key={item.n} opacity={activo ? 1 : 0.35}>
              <text x="672" y={yBarra} fill="#cbd5e1" fontSize="13" fontFamily="monospace">
                S{item.n} = {item.s.toFixed(3)}
              </text>
              <rect x="672" y={yBarra + 8} width="208" height="10" rx="5" fill="#1e293b" />
              <rect
                x="672"
                y={yBarra + 8}
                width={activo ? ancho : 8}
                height="10"
                rx="5"
                fill={item.n === nActual ? '#38bdf8' : '#34d399'}
              />
              <text x="880" y={yBarra} fill="#93c5fd" fontSize="12" textAnchor="end" fontFamily="monospace">
                {item.err.toFixed(4)}
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  if (visual === 'err-cancelacion' || visual === 'err-suma') {
    const esCancel = visual === 'err-cancelacion'
    const barrido = interpolate(p, [0.1, 0.85], [0, 1], { easing: Easing.easeOutCubic })
    const pctError = esCancel ? Math.round(150 * barrido) : Math.round(80 * (1 - barrido * 0.75))

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          {esCancel
            ? 'Cancelación catastrófica: cifras exactas se destruyen al restar (t = 4)'
            : 'Orden de la suma en precisión finita (t = 4): absorción de sumandos pequeños'}
        </text>

        <rect x="64" y="122" width="540" height="316" rx="14" fill="#0b1324" stroke="#334155" />
        {esCancel ? (
          <>
            <text x="88" y="158" fill="#94a3b8" fontSize="14">Registro de mantisa redondeada (4 cifras significativas)</text>
            {[
              { etiqueta: 'ã =', digitos: ['0', '.', '1', '2', '3', '5'], cancelar: 4 },
              { etiqueta: 'b̃ =', digitos: ['0', '.', '1', '2', '3', '4'], cancelar: 4 },
              { etiqueta: 'ã − b̃ =', digitos: ['0', '.', '0', '0', '0', '1'], cancelar: 6 },
            ].map((fila, rIdx) => (
              <g key={fila.etiqueta} transform={`translate(88, ${188 + rIdx * 72})`}>
                <text x="0" y="30" fill="#cbd5e1" fontSize="18" fontWeight="700" fontFamily="monospace">
                  {fila.etiqueta}
                </text>
                {fila.digitos.map((d, dIdx) => {
                  const borrado = rIdx < 2 && dIdx >= 2 && dIdx <= 4 && barrido > (dIdx - 1) * 0.25
                  const esRuido = rIdx === 2 && dIdx === 5
                  return (
                    <g key={dIdx} transform={`translate(${96 + dIdx * 58}, 0)`}>
                      <rect
                        width="48"
                        height="46"
                        rx="8"
                        fill={esRuido ? 'rgba(248,113,113,0.2)' : borrado ? 'rgba(245,158,11,0.12)' : '#172033'}
                        stroke={esRuido ? '#f87171' : borrado ? '#f59e0b' : '#334155'}
                      />
                      <text
                        x="24"
                        y="31"
                        fill={esRuido ? '#fca5a5' : borrado ? '#fbbf24' : '#f8fafc'}
                        fontSize="22"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {d}
                      </text>
                      {borrado && (
                        <line x1="8" y1="38" x2="40" y2="8" stroke="#f87171" strokeWidth="2.4" />
                      )}
                    </g>
                  )
                })}
              </g>
            ))}
          </>
        ) : (
          <>
            <text x="88" y="160" fill="#94a3b8" fontSize="14">Comparación de flujo en t = 4 cifras</text>
            <g transform="translate(88, 190)">
              <rect width="490" height="88" rx="10" fill="#172033" stroke="#f87171" strokeOpacity="0.65" />
              <text x="16" y="28" fill="#fca5a5" fontSize="15" fontWeight="700">Orden dado: (1000 + 0.4) + 0.4</text>
              <text x="16" y="54" fill="#e2e8f0" fontSize="15" fontFamily="monospace">
                1000 + 0.4 = 1000.4 → 1000 (se absorbe el 0.4)
              </text>
              <text x="16" y="75" fill="#f87171" fontSize="13" fontFamily="monospace">
                Resultado final = 1000 · Error = 0.8
              </text>
            </g>
            <g transform={`translate(88, ${304 - (1 - barrido) * 8})`} opacity={0.35 + 0.65 * barrido}>
              <rect width="490" height="96" rx="10" fill="#13251e" stroke="#34d399" strokeOpacity="0.85" />
              <text x="16" y="28" fill="#6ee7b7" fontSize="15" fontWeight="700">Orden creciente: 1000 + (0.4 + 0.4)</text>
              <text x="16" y="54" fill="#e2e8f0" fontSize="15" fontFamily="monospace">
                0.4 + 0.4 = 0.8  →  1000 + 0.8 = 1000.8 → 1001
              </text>
              <text x="16" y="77" fill="#34d399" fontSize="13" fontFamily="monospace">
                Resultado final = 1001 · Error = 0.2 (4× menor)
              </text>
            </g>
          </>
        )}

        {/* Medidor derecho */}
        <rect x="634" y="122" width="268" height="316" rx="14" fill="#0b1324" stroke="#334155" />
        <text x="656" y="158" fill="#e2e8f0" fontSize="15" fontWeight="700">
          {esCancel ? 'Amplificación del error relativo' : 'Error residual de la suma'}
        </text>
        <text x="768" y="242" fill={esCancel ? '#f87171' : '#34d399'} fontSize="48" fontWeight="800" textAnchor="middle" fontFamily="monospace">
          {esCancel ? `${pctError}%` : fmtNum(0.8 - 0.6 * barrido, 2)}
        </text>
        <rect x="658" y="280" width="220" height="16" rx="8" fill="#1e293b" />
        <rect
          x="658"
          y="280"
          width={interpolate(barrido, [0, 1], [16, 220])}
          height="16"
          rx="8"
          fill={esCancel ? '#f87171' : '#34d399'}
        />
        <text x="658" y="330" fill="#cbd5e1" fontSize="13">
          {esCancel ? 'Exacto: 0.00004 · Calculado: 0.0001' : 'Agrupar menores conserva cifras bajas'}
        </text>
        <text x="658" y="354" fill="#94a3b8" fontSize="12.5">
          {esCancel ? '0 cifras significativas sobrevivientes' : 'Suma en punto flotante no es asociativa'}
        </text>
      </g>
    )
  }

  // err-medida / err-corte: Zoom continuo a recta numérica + escaneo dígito a dígito
  const esCorte = visual === 'err-corte'
  const zoom = interpolate(p, [0, 0.75], [0, 1], { easing: Easing.easeOutExpo })
  const yLinea = 290
  const xStart = 96
  const xEnd = 864
  const xExact = esCorte ? 536 : 418
  const xCorte = 320
  const xRedondeo = 640

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {esCorte
          ? 'Zoom a la recta numérica: corte (2.66) vs redondeo (2.67) con t = 3 cifras'
          : 'Recta real y cifras significativas: π = 3.14159265 frente a 22/7 = 3.14285714'}
      </text>

      {/* Tarjeta superior dígito a dígito */}
      <rect x="64" y="114" width="836" height="96" rx="12" fill="#0b1324" stroke="#334155" />
      <text x="86" y="142" fill="#94a3b8" fontSize="13">
        {esCorte ? 'Escaneo de dígitos de 8/3 = 2.66666... (4.ª cifra = 6 ≥ 5)' : 'Comparación dígito a dígito entre π y 22/7'}
      </text>
      {(esCorte ? ['2', '.', '6', '6', '6', '6'] : ['3', '.', '1', '4', '1', '5']).map((dig, idx) => {
        const activo = p >= idx * 0.12
        const esDecisivo = esCorte ? idx === 4 : idx >= 4
        return (
          <g key={idx} transform={`translate(${88 + idx * 62}, 154)`} opacity={activo ? 1 : 0.28}>
            <rect
              width="48"
              height="42"
              rx="8"
              fill={esDecisivo ? 'rgba(245,158,11,0.2)' : 'rgba(56,189,248,0.16)'}
              stroke={esDecisivo ? '#f59e0b' : '#38bdf8'}
            />
            <text x="24" y="28" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle" fontFamily="monospace">
              {dig}
            </text>
          </g>
        )
      })}
      <text x="488" y="182" fill="#34d399" fontSize="17" fontWeight="700" fontFamily="monospace">
        {esCorte ? '→ corte: 2.66  |  redondeo: 2.67' : '→ 3 cifras correctas (3.14)'}
      </text>

      {/* Recta numérica con malla flotante */}
      <line x1={xStart} y1={yLinea} x2={xEnd} y2={yLinea} stroke="#64748b" strokeWidth="2.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => {
        const xTick = xStart + ((xEnd - xStart) * k) / 10
        return (
          <g key={k} opacity={0.35 + 0.65 * zoom}>
            <line x1={xTick} y1={yLinea - 10} x2={xTick} y2={yLinea + 10} stroke="#475569" strokeWidth="1.5" />
            <text x={xTick} y={yLinea + 30} fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="monospace">
              {esCorte ? (2.658 + k * 0.0014).toFixed(3) : (3.141 + k * 0.00025).toFixed(4)}
            </text>
          </g>
        )
      })}

      {/* Puntos en la recta */}
      <circle cx={xExact} cy={yLinea} r={8 * zoom + 2} fill="#34d399" filter={glowUrl} />
      <text x={xExact} y={yLinea - 24} fill="#6ee7b7" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="monospace">
        {esCorte ? '8/3 = 2.6666…' : 'π = 3.14159'}
      </text>

      {esCorte ? (
        <>
          <circle cx={xCorte} cy={yLinea} r="7" fill="#f87171" opacity={zoom} />
          <text x={xCorte} y={yLinea + 58} fill="#fca5a5" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            Corte: 2.66 (E = 0.0067)
          </text>
          <circle cx={xRedondeo} cy={yLinea} r="7" fill="#38bdf8" opacity={zoom} />
          <text x={xRedondeo} y={yLinea + 58} fill="#7dd3fc" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            Redondeo: 2.67 (E = 0.0033)
          </text>
          {/* Corchete de error */}
          <path
            d={`M ${xExact} ${yLinea + 82} L ${xExact} ${yLinea + 92} L ${xRedondeo} ${yLinea + 92} L ${xRedondeo} ${yLinea + 82}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            opacity={zoom}
          />
          <text x={(xExact + xRedondeo) / 2} y={yLinea + 114} fill="#38bdf8" fontSize="14" textAnchor="middle" fontWeight="700">
            Mitad del error (≤ 0.5·10¹⁻ᵗ)
          </text>
        </>
      ) : (
        <>
          <circle cx={725} cy={yLinea} r="7.5" fill="#f59e0b" opacity={zoom} />
          <text x="725" y={yLinea - 24} fill="#fbbf24" fontSize="15" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            22/7 = 3.14286
          </text>
          <path
            d={`M ${xExact} ${yLinea + 68} L ${xExact} ${yLinea + 82} L 725 ${yLinea + 82} L 725 ${yLinea + 68}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            opacity={zoom}
          />
          <text x={(xExact + 725) / 2} y={yLinea + 106} fill="#fbbf24" fontSize="15" textAnchor="middle" fontWeight="700" fontFamily="monospace">
            E_abs = |π − 22/7| ≈ 1.2645×10⁻³ · E_% = 0.04025%
          </text>
        </>
      )}
    </g>
  )
}

function EscenarioEcuaciones({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })
  const f = (x: number) => x * x * x - x - 2
  const df = (x: number) => 3 * x * x - 1
  const raiz = 1.5213797068

  if (visual === 'm1-convergencia') {
    const mapK = (k: number) => interpolate(k, [0, 8], [110, 820])
    const mapLogErr = (le: number) => interpolate(le, [-12, 0], [435, 125])
    const kMax = interpolate(p, [0.05, 0.9], [0.4, 8], { easing: Easing.easeOutCubic })

    const ptsBis: string[] = []
    const ptsSec: string[] = []
    const ptsNew: string[] = []
    const errBis = [0, -0.3, -0.6, -0.9, -1.2, -1.5, -1.8, -2.1, -2.4]
    const errSec = [0, -0.7, -1.1, -1.9, -3.1, -5.0, -8.1, -11.5, -12.0]
    const errNew = [0, -1.66, -3.44, -6.99, -12.0]

    for (let k = 0; k <= 8; k++) {
      if (k <= kMax + 0.05) {
        const kx = mapK(Math.min(k, kMax))
        ptsBis.push(`${k === 0 ? 'M' : 'L'} ${kx.toFixed(1)} ${mapLogErr(errBis[k]).toFixed(1)}`)
        ptsSec.push(`${k === 0 ? 'M' : 'L'} ${kx.toFixed(1)} ${mapLogErr(errSec[k]).toFixed(1)}`)
      }
      if (k < errNew.length && k <= kMax + 0.05) {
        const kx = mapK(Math.min(k, kMax))
        ptsNew.push(`${k === 0 ? 'M' : 'L'} ${kx.toFixed(1)} ${mapLogErr(errNew[k]).toFixed(1)}`)
      }
    }

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          Velocidad comparada (escala log₁₀|error|): p = 2 vs φ ≈ 1.618 vs p = 1
        </text>
        {[0, -3, -6, -9, -12].map((le) => (
          <g key={le}>
            <line x1="110" y1={mapLogErr(le)} x2="840" y2={mapLogErr(le)} stroke="#1e293b" strokeWidth="1" />
            <text x="98" y={mapLogErr(le) + 4} fill="#94a3b8" fontSize="13" textAnchor="end" fontFamily="monospace">
              10^{le}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6, 8].map((k) => (
          <g key={k}>
            <line x1={mapK(k)} y1="120" x2={mapK(k)} y2="435" stroke="#1e293b" strokeWidth="1" />
            <text x={mapK(k)} y="460" fill="#94a3b8" fontSize="13" textAnchor="middle" fontFamily="monospace">
              k={k}
            </text>
          </g>
        ))}
        <path d={ptsBis.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="3.2" />
        <path d={ptsSec.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="3.4" />
        <path d={ptsNew.join(' ')} fill="none" stroke="#34d399" strokeWidth="3.8" filter={glowUrl} />

        <g transform="translate(560, 134)">
          <rect width="276" height="106" rx="10" fill="#0b1324" stroke="#334155" />
          <text x="16" y="28" fill="#34d399" fontSize="14.5" fontWeight="700">● Newton: p = 2 (3–4 pasos)</text>
          <text x="16" y="56" fill="#38bdf8" fontSize="14.5" fontWeight="700">● Secante: φ ≈ 1.618 (7 pasos)</text>
          <text x="16" y="84" fill="#f59e0b" fontSize="14.5" fontWeight="700">● Bisección: p = 1 (20 pasos)</text>
        </g>
      </g>
    )
  }

  const mapX = (x: number) => interpolate(x, [0.7, 2.18], [96, 860])
  const mapY = (y: number) => interpolate(y, [-2.8, 4.5], [450, 108])
  const rutaF = muestrearRuta(f, 0.75, 2.12, mapX, mapY, 100)
  const drawFactor = interpolate(p, [0, 0.35], [0, 1], { easing: Easing.easeOutCubic })

  // Iteraciones discretas reales de Newton-Raphson desde x0 = 2.0 (convergencia p = 2)
  const pasosNewton: { k: number; xk: number; yk: number; xSig: number }[] = []
  let xTmp = 2.0
  for (let k = 0; k < 3; k++) {
    const yTmp = f(xTmp)
    const xNext = xTmp - yTmp / df(xTmp)
    pasosNewton.push({ k, xk: xTmp, yk: yTmp, xSig: xNext })
    xTmp = xNext
  }
  const faseNewton = interpolate(p, [0.12, 0.92], [0, pasosNewton.length])
  const iterNewtonActiva = Math.min(pasosNewton.length - 1, Math.floor(faseNewton))
  const subNewton = clamp(faseNewton - iterNewtonActiva, 0, 1)

  const bisPaso = p < 0.35 ? [1, 2] : p < 0.65 ? [1.5, 2] : [1.5, 1.75]
  const secA = p < 0.5 ? 1.0 : 1.3333
  const secB = p < 0.5 ? 2.0 : 2.0
  const secNext = secB - f(secB) * ((secB - secA) / (f(secB) - f(secA)))

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {visual === 'm1-newton'
          ? 'Newton-Raphson: disparos sucesivos de tangente (x₀ → x₁ → x₂ → x₃)'
          : visual === 'm1-secante'
            ? 'Secante: cuerda entre los dos últimos puntos (sin derivada)'
            : visual === 'm1-biseccion'
              ? 'Bisección: reducción geométrica del intervalo [aₖ, bₖ] ÷ 2'
              : 'f(x) = x³ − x − 2: cambio de signo en [1, 2] y raíz r ≈ 1.5214'}
      </text>

      {/* Ejes y cuadrícula */}
      {[1, 1.5, 2].map((gx) => (
        <g key={gx}>
          <line x1={mapX(gx)} y1="108" x2={mapX(gx)} y2="450" stroke="#1e293b" strokeWidth="1" />
          <text x={mapX(gx)} y={mapY(0) + 22} fill="#94a3b8" fontSize="13" textAnchor="middle" fontFamily="monospace">
            {gx}
          </text>
        </g>
      ))}
      <line x1="88" y1={mapY(0)} x2="870" y2={mapY(0)} stroke="#64748b" strokeWidth="1.8" />
      <text x="875" y={mapY(0) + 4} fill="#94a3b8" fontSize="12">y = 0</text>

      {/* Curva f(x) trazada continuamente */}
      <path
        d={rutaF}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="3.5"
        pathLength={1000}
        strokeDasharray="1000"
        strokeDashoffset={1000 * (1 - drawFactor)}
        filter={glowUrl}
      />

      {visual === 'm1-biseccion' && (
        <g>
          <rect
            x={mapX(bisPaso[0])}
            y="112"
            width={Math.max(8, mapX(bisPaso[1]) - mapX(bisPaso[0]))}
            height="332"
            fill="rgba(56, 189, 248, 0.12)"
            stroke="#38bdf8"
            strokeDasharray="5 4"
          />
          <circle cx={mapX((bisPaso[0] + bisPaso[1]) / 2)} cy={mapY(0)} r="7" fill="#f59e0b" />
          <text x={mapX((bisPaso[0] + bisPaso[1]) / 2)} y={mapY(0) + 42} fill="#fbbf24" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            c = {((bisPaso[0] + bisPaso[1]) / 2).toFixed(3)} · [{bisPaso[0]}, {bisPaso[1]}]
          </text>
        </g>
      )}

      {visual === 'm1-newton' && (
        <g>
          <rect x="76" y="114" width="268" height="122" rx="10" fill="#0b1324" stroke="#334155" />
          <text x="92" y="140" fill="#e2e8f0" fontSize="13.5" fontWeight="700">Convergencia cuadrática (p = 2)</text>
          {pasosNewton.map((paso) => {
            const alcanzado = paso.k <= iterNewtonActiva
            const activo = paso.k === iterNewtonActiva
            return (
              <text
                key={`hud-${paso.k}`}
                x="92"
                y={166 + paso.k * 22}
                fill={activo ? '#fbbf24' : alcanzado ? '#6ee7b7' : '#64748b'}
                fontSize="13"
                fontFamily="monospace"
                fontWeight={activo ? '700' : '500'}
              >
                k={paso.k}: {paso.xk.toFixed(4)} → {paso.xSig.toFixed(4)}
              </text>
            )
          })}

          {pasosNewton.map((paso) => {
            if (paso.k > iterNewtonActiva) return null
            const esActual = paso.k === iterNewtonActiva
            const vertFrac = esActual ? interpolate(subNewton, [0, 0.28], [0, 1], { easing: Easing.easeOutCubic }) : 1
            const tangFrac = esActual ? interpolate(subNewton, [0.24, 0.84], [0, 1], { easing: Easing.easeOutCubic }) : 1
            const yDrop = interpolate(vertFrac, [0, 1], [mapY(0), mapY(paso.yk)])
            const xTip = interpolate(tangFrac, [0, 1], [mapX(paso.xk), mapX(paso.xSig)])
            const yTip = interpolate(tangFrac, [0, 1], [mapY(paso.yk), mapY(0)])
            const landingListo = !esActual || subNewton >= 0.8

            return (
              <g key={paso.k} opacity={esActual ? 1 : 0.36}>
                <line
                  x1={mapX(paso.xk)}
                  y1={mapY(0)}
                  x2={mapX(paso.xk)}
                  y2={yDrop}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth="1.6"
                />
                {tangFrac > 0.02 && (
                  <line
                    x1={mapX(paso.xk)}
                    y1={mapY(paso.yk)}
                    x2={xTip}
                    y2={yTip}
                    stroke="#f59e0b"
                    strokeWidth={esActual ? 3.4 : 2.2}
                    filter={esActual ? glowUrl : undefined}
                  />
                )}
                <circle cx={mapX(paso.xk)} cy={mapY(paso.yk)} r={esActual ? 7 : 5} fill="#fbbf24" />
                {landingListo && (
                  <circle cx={mapX(paso.xSig)} cy={mapY(0)} r={esActual ? 6.8 : 4.8} fill="#34d399" />
                )}
                {esActual && (
                  <>
                    <text
                      x={Math.min(720, mapX(paso.xk) + 12)}
                      y={mapY(paso.yk) - 10}
                      fill="#fbbf24"
                      fontSize="13.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      x{paso.k} = {paso.xk.toFixed(4)}
                    </text>
                    {landingListo && (
                      <text
                        x={mapX(paso.xSig)}
                        y={mapY(0) + 46}
                        fill="#6ee7b7"
                        fontSize="13.5"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        x{paso.k + 1} = {paso.xSig.toFixed(4)}
                      </text>
                    )}
                  </>
                )}
              </g>
            )
          })}
        </g>
      )}

      {visual === 'm1-secante' && (
        <g>
          <line
            x1={mapX(secA)}
            y1={mapY(f(secA))}
            x2={mapX(secB)}
            y2={mapY(f(secB))}
            stroke="#f59e0b"
            strokeWidth="3"
          />
          <circle cx={mapX(secA)} cy={mapY(f(secA))} r="6.5" fill="#f59e0b" />
          <circle cx={mapX(secB)} cy={mapY(f(secB))} r="6.5" fill="#f59e0b" />
          <circle cx={mapX(secNext)} cy={mapY(0)} r="7" fill="#34d399" />
          <text x={mapX(secNext)} y={mapY(0) + 42} fill="#6ee7b7" fontSize="14" fontWeight="700" textAnchor="middle" fontFamily="monospace">
            corte secante ≈ {secNext.toFixed(4)}
          </text>
        </g>
      )}

      <circle cx={mapX(raiz)} cy={mapY(0)} r="7.5" fill="#34d399" stroke="#064e3b" strokeWidth="2" />
      <text x={mapX(raiz) - 10} y={mapY(0) - 14} fill="#6ee7b7" fontSize="14" fontWeight="700" textAnchor="end" fontFamily="monospace">
        raíz r ≈ 1.5214
      </text>
    </g>
  )
}

function EscenarioSistemas({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })

  if (visual === 'm2-gs' || visual === 'm2-residuo') {
    // Sistema 2D visual: 4x + y = 9 y 2x + 5y = 13 -> intersección (16/9, 17/9)
    const mapX = (x: number) => interpolate(x, [0, 3.2], [96, 570])
    const mapY = (y: number) => interpolate(y, [0, 3.2], [440, 118])

    const pasosGS: [number, number][] = [
      [0, 0],
      [2.25, 0],
      [2.25, 1.7],
      [1.825, 1.7],
      [1.825, 1.87],
      [1.7825, 1.87],
      [1.7825, 1.887],
      [16 / 9, 17 / 9],
    ]
    const progresoPasos = interpolate(p, [0.1, 0.88], [0, pasosGS.length - 1])
    const segmentos: string[] = [`M ${mapX(0).toFixed(1)} ${mapY(0).toFixed(1)}`]
    for (let i = 1; i < pasosGS.length; i++) {
      if (progresoPasos >= i) {
        segmentos.push(`L ${mapX(pasosGS[i][0]).toFixed(1)} ${mapY(pasosGS[i][1]).toFixed(1)}`)
      } else if (progresoPasos > i - 1) {
        const f = progresoPasos - (i - 1)
        const ix = pasosGS[i - 1][0] + f * (pasosGS[i][0] - pasosGS[i - 1][0])
        const iy = pasosGS[i - 1][1] + f * (pasosGS[i][1] - pasosGS[i - 1][1])
        segmentos.push(`L ${mapX(ix).toFixed(1)} ${mapY(iy).toFixed(1)}`)
      }
    }

    const rInf = Math.max(1e-6, 13 * Math.pow(0.18, progresoPasos * 0.8))

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          {visual === 'm2-gs'
            ? 'Trayectoria 2D de Gauss-Seidel hacia la intersección (16/9, 17/9)'
            : 'Control de parada por residuo ||b − Ax̃||_∞ ≤ tol'}
        </text>

        <line x1="96" y1="440" x2="575" y2="440" stroke="#475569" strokeWidth="1.8" />
        <line x1="96" y1="118" x2="96" y2="440" stroke="#475569" strokeWidth="1.8" />
        <line x1={mapX(1.4)} y1={mapY(9 - 4 * 1.4)} x2={mapX(2.25)} y2={mapY(0)} stroke="#38bdf8" strokeWidth="2.8" />
        <line x1={mapX(0)} y1={mapY(13 / 5)} x2={mapX(3.0)} y2={mapY((13 - 6) / 5)} stroke="#f59e0b" strokeWidth="2.8" strokeDasharray="7 5" />

        <path d={segmentos.join(' ')} fill="none" stroke="#34d399" strokeWidth="3" filter={glowUrl} />
        <circle cx={mapX(16 / 9)} cy={mapY(17 / 9)} r="7" fill="#34d399" stroke="#ecfdf5" strokeWidth="2" />
        <text x={mapX(16 / 9) + 12} y={mapY(17 / 9) - 10} fill="#6ee7b7" fontSize="14" fontWeight="700" fontFamily="monospace">
          (1.778, 1.889)
        </text>

        <rect x="612" y="118" width="292" height="322" rx="14" fill="#0b1324" stroke="#334155" />
        <text x="634" y="152" fill="#e2e8f0" fontSize="15" fontWeight="700">Residuo en tiempo real</text>
        <text x="634" y="198" fill="#34d399" fontSize="30" fontWeight="800" fontFamily="monospace">
          ||r||_∞ = {rInf.toFixed(4)}
        </text>
        <rect x="634" y="224" width="244" height="14" rx="7" fill="#1e293b" />
        <rect
          x="634"
          y="224"
          width={Math.max(10, interpolate(rInf, [0, 13], [10, 244]))}
          height="14"
          rx="7"
          fill={rInf < 0.5 ? '#34d399' : '#f59e0b'}
        />
        <text x="634" y="280" fill="#cbd5e1" fontSize="14">4x₁ + x₂ = 9  (azul)</text>
        <text x="634" y="308" fill="#fbbf24" fontSize="14">2x₁ + 5x₂ = 13 (ámbar)</text>
        <text x="634" y="352" fill="#94a3b8" fontSize="13">Cada paso actualiza x₁ y x₂ al instante</text>
      </g>
    )
  }

  // m2-planteo / m2-gauss / m2-dominancia: Matriz aumentada [A|b] con intercambio visual de filas
  const swapProgress = visual === 'm2-dominancia' || visual === 'm2-gauss'
    ? interpolate(p, [0.18, 0.55], [0, 1], { easing: Easing.easeInOutCubic })
    : 1
  const filasIniciales = [
    [1, 5, 1, 14],
    [4, 1, 1, 9],
    [1, 1, 6, 21],
  ]

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {visual === 'm2-gauss'
          ? 'Pivoteo parcial: intercambio de filas para acotar |m_ik| ≤ 1'
          : visual === 'm2-dominancia'
            ? 'Reordenamiento hacia dominancia diagonal estricta |a_ii| > Σ|a_ij|'
            : 'Matriz aumentada [A | b] y solución exacta x = (1, 2, 3)'}
      </text>

      {filasIniciales.map((fila, idx) => {
        const yOrigen = 148 + idx * 96
        const yDestino = idx === 0 ? 148 + 96 : idx === 1 ? 148 : yOrigen
        const yAnim = yOrigen + (yDestino - yOrigen) * swapProgress
        const arcoX = idx <= 1 ? Math.sin(swapProgress * Math.PI) * (idx === 0 ? 22 : -22) : 0
        const filaFinalIdx = swapProgress > 0.5 ? (idx === 0 ? 1 : idx === 1 ? 0 : 2) : idx

        return (
          <g key={idx} transform={`translate(${92 + arcoX}, ${yAnim})`}>
            {fila.map((val, col) => {
              const diag = filaFinalIdx === col && col < 3
              const esB = col === 3
              return (
                <g key={col} transform={`translate(${col * 102 + (esB ? 24 : 0)}, 0)`}>
                  <rect
                    width="84"
                    height="68"
                    rx="12"
                    fill={diag ? 'rgba(14, 165, 233, 0.25)' : esB ? '#13251e' : '#111b2e'}
                    stroke={diag ? '#38bdf8' : esB ? '#34d399' : '#334155'}
                    strokeWidth={diag ? '2.5' : '1.4'}
                  />
                  <text x="42" y="42" fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                    {val}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Panel derecho de pivotes / dominancia */}
      <rect x="570" y="148" width="328" height="260" rx="14" fill="#0b1324" stroke="#334155" />
      <text x="594" y="184" fill="#34d399" fontSize="16" fontWeight="700">Verificación diagonal</text>
      <text x="594" y="224" fill="#e2e8f0" fontSize="15" fontFamily="monospace">F₁: |4| &gt; |1| + |1| = 2  ✔</text>
      <text x="594" y="264" fill="#e2e8f0" fontSize="15" fontFamily="monospace">F₂: |5| &gt; |1| + |1| = 2  ✔</text>
      <text x="594" y="304" fill="#e2e8f0" fontSize="15" fontFamily="monospace">F₃: |6| &gt; |1| + |1| = 2  ✔</text>
      <text x="594" y="362" fill="#fbbf24" fontSize="15" fontWeight="700" fontFamily="monospace">
        x* = (1, 2, 3) · |m_ik| ≤ 1
      </text>
    </g>
  )
}

function EscenarioInterpolacion({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })
  const nodosX = [0, 1, 2, 3]
  const nodosY = [1, 2, 2, 4]

  if (visual === 'm3-lagrange') {
    const mapX = (x: number) => interpolate(x, [-0.2, 3.2], [96, 864])
    const mapY = (y: number) => interpolate(y, [-0.6, 4.4], [435, 112])

    const L = (i: number, x: number) => {
      let prod = 1
      for (let j = 0; j < 4; j++) {
        if (j !== i) prod *= (x - nodosX[j]) / (nodosX[i] - nodosX[j])
      }
      return prod
    }
    const P = (x: number) => nodosY.reduce((s, yi, i) => s + yi * L(i, x), 0)

    const activaIdx = Math.min(3, Math.floor(p * 4.5))
    const mezclaPoli = interpolate(p, [0.55, 0.92], [0, 1], { easing: Easing.easeOutCubic })

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          Bases de Lagrange Lᵢ(x) (valen 1 en xᵢ, 0 en otros nodos) → suma P(x)
        </text>
        <line x1="96" y1={mapY(0)} x2="864" y2={mapY(0)} stroke="#475569" strokeWidth="1.5" />
        <line x1="96" y1={mapY(1)} x2="864" y2={mapY(1)} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

        {[0, 1, 2, 3].map((i) => {
          const colores = ['#f59e0b', '#38bdf8', '#a78bfa', '#34d399']
          const rutaL = muestrearRuta((x) => L(i, x), -0.1, 3.1, mapX, mapY, 70)
          const destacada = i === activaIdx
          return (
            <path
              key={i}
              d={rutaL}
              fill="none"
              stroke={colores[i]}
              strokeWidth={destacada ? 3.2 : 1.6}
              opacity={destacada ? 0.95 : 0.35}
            />
          )
        })}

        <path
          d={muestrearRuta(P, -0.05, 3.05, mapX, mapY, 85)}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="3.6"
          opacity={0.25 + 0.75 * mezclaPoli}
          filter={glowUrl}
        />
        {nodosX.map((nx, i) => (
          <g key={i}>
            <circle cx={mapX(nx)} cy={mapY(nodosY[i])} r="6.5" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx={mapX(nx)} cy={mapY(1)} r="4" fill={i === activaIdx ? '#f59e0b' : '#475569'} />
          </g>
        ))}
        <circle cx={mapX(1.5)} cy={mapY(1.9375)} r="7" fill="#34d399" opacity={mezclaPoli} />
        <text x={mapX(1.5) + 12} y={mapY(1.9375) + 22} fill="#6ee7b7" fontSize="14.5" fontWeight="700" fontFamily="monospace">
          P(1.5) = 1.9375
        </text>
      </g>
    )
  }

  if (visual === 'm3-runge') {
    const mapX = (x: number) => interpolate(x, [-1.1, 1.1], [96, 864])
    const mapY = (y: number) => interpolate(y, [-0.35, 1.18], [440, 115])
    const runge = (x: number) => 1 / (1 + 25 * x * x)
    const rx = [-1, -0.6, -0.2, 0.2, 0.6, 1]
    const ry = rx.map(runge)
    const poly6 = (x: number) => {
      let s = 0
      for (let i = 0; i < rx.length; i++) {
        let li = 1
        for (let j = 0; j < rx.length; j++) if (j !== i) li *= (x - rx[j]) / (rx[i] - rx[j])
        s += ry[i] * li
      }
      return s
    }
    const mezcla = interpolate(p, [0.1, 0.8], [0, 1], { easing: Easing.easeOutCubic })

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          Fenómeno de Runge: 6 nodos equiespaciados oscilan en los bordes
        </text>
        <line x1="96" y1={mapY(0)} x2="864" y2={mapY(0)} stroke="#475569" strokeWidth="1.5" />
        <path d={muestrearRuta(runge, -1.02, 1.02, mapX, mapY, 90)} fill="none" stroke="#34d399" strokeWidth="3.2" />
        <path d={muestrearRuta(poly6, -1.0, 1.0, mapX, mapY, 90)} fill="none" stroke="#f87171" strokeWidth="3.2" opacity={mezcla} filter={glowUrl} />
        {rx.map((x, i) => (
          <circle key={i} cx={mapX(x)} cy={mapY(ry[i])} r="6" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
        ))}
        <text x={mapX(0.8)} y={mapY(-0.05) + 34} fill="#fca5a5" fontSize="14.5" fontWeight="700" textAnchor="middle" fontFamily="monospace">
          P(0.8) ≈ −0.0481 (oscilación)
        </text>
      </g>
    )
  }

  // m3-datos / m3-regresion / m3-decision: Recta minimizando cuadrados residuales
  const mapX = (x: number) => interpolate(x, [-0.25, 3.35], [100, 860])
  const mapY = (y: number) => interpolate(y, [0.4, 4.5], [440, 112])
  const progresoRecta = interpolate(p, [0.1, 0.75], [0, 1], { easing: Easing.easeOutCubic })
  const b1 = 0.25 + (0.9 - 0.25) * progresoRecta
  const b0 = 1.9 + (0.9 - 1.9) * progresoRecta

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {visual === 'm3-regresion'
          ? 'Mínimos cuadrados: la recta rota para minimizar los cuadrados residuales (SSE)'
          : 'Datos exactos (Lagrange) frente a tendencia lineal con ruido (Regresión)'}
      </text>
      <line x1="100" y1="440" x2="860" y2="440" stroke="#475569" strokeWidth="1.5" />

      {/* Cuadrados de residuos (y_i - yhat_i)^2 */}
      {nodosX.map((xi, i) => {
        const yi = nodosY[i]
        const yh = b0 + b1 * xi
        const px = mapX(xi)
        const py = mapY(yi)
        const pyh = mapY(yh)
        const lado = Math.abs(py - pyh)
        const top = Math.min(py, pyh)
        return (
          <g key={i}>
            <rect
              x={px}
              y={top}
              width={lado}
              height={lado}
              fill="rgba(245, 158, 11, 0.22)"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <line x1={px} y1={py} x2={px} y2={pyh} stroke="#fbbf24" strokeWidth="2.5" />
          </g>
        )
      })}

      {/* Recta de regresión */}
      <line
        x1={mapX(-0.1)}
        y1={mapY(b0 + b1 * -0.1)}
        x2={mapX(3.2)}
        y2={mapY(b0 + b1 * 3.2)}
        stroke="#f59e0b"
        strokeWidth="3.5"
        filter={glowUrl}
      />

      {/* Nodos */}
      {nodosX.map((xi, i) => (
        <circle key={i} cx={mapX(xi)} cy={mapY(nodosY[i])} r="7" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2.5" />
      ))}

      <text x="120" y="148" fill="#fbbf24" fontSize="16" fontWeight="700" fontFamily="monospace">
        ŷ = {b0.toFixed(2)} + {b1.toFixed(2)}x · R² ≈ 0.853
      </text>
    </g>
  )
}

function EscenarioIntegracion({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })

  if (visual === 'm4-derivacion') {
    const mapX = (t: number) => interpolate(t, [0.4, 1.75], [88, 456])
    const mapY = (y: number) => interpolate(y, [1.4, 5.8], [440, 120])
    const f = (t: number) => Math.exp(t)
    const h = interpolate(p, [0.05, 0.75], [0.55, 0.04], { easing: Easing.easeOutCubic })
    const t0 = 1.0
    const pend = (f(t0 + h) - f(t0 - h)) / (2 * h)

    // Curva en U log-log en el panel derecho
    const mapLogH = (lh: number) => interpolate(lh, [-14, -1], [520, 880])
    const mapLogE = (le: number) => interpolate(le, [-12, -1], [435, 130])
    const rutaU = muestrearRuta(
      (lh) => {
        const hVal = Math.pow(10, lh)
        const errEst = 0.5 * hVal * hVal + 1e-16 / hVal
        return clamp(Math.log10(errEst), -11.5, -1.2)
      },
      -14,
      -1,
      mapLogH,
      mapLogE,
      80,
    )
    const lhActual = interpolate(p, [0.1, 0.9], [-1, -12.5])
    const leActual = clamp(Math.log10(0.5 * Math.pow(10, 2 * lhActual) + 1e-16 / Math.pow(10, lhActual)), -11.5, -1.2)

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          Derivación central: cuerda secante → tangente y curva en «U» truncamiento vs redondeo
        </text>
        {/* Panel izquierdo */}
        <rect x="64" y="112" width="420" height="350" rx="14" fill="#0b1324" stroke="#334155" />
        <path d={muestrearRuta(f, 0.45, 1.7, mapX, mapY, 70)} fill="none" stroke="#38bdf8" strokeWidth="3.2" />
        <line
          x1={mapX(t0 - 0.45)}
          y1={mapY(f(t0) - pend * 0.45)}
          x2={mapX(t0 + 0.45)}
          y2={mapY(f(t0) + pend * 0.45)}
          stroke="#f59e0b"
          strokeWidth="3"
        />
        <circle cx={mapX(t0 - h)} cy={mapY(f(t0 - h))} r="5.5" fill="#fbbf24" />
        <circle cx={mapX(t0 + h)} cy={mapY(f(t0 + h))} r="5.5" fill="#fbbf24" />
        <circle cx={mapX(t0)} cy={mapY(f(t0))} r="6" fill="#34d399" />
        <text x="86" y="146" fill="#fbbf24" fontSize="14" fontFamily="monospace">h = {h.toFixed(3)} → f′ ≈ {pend.toFixed(4)}</text>

        {/* Panel derecho: Curva en U */}
        <rect x="500" y="112" width="404" height="350" rx="14" fill="#0b1324" stroke="#334155" />
        <text x="522" y="142" fill="#e2e8f0" fontSize="14.5" fontWeight="700">Error total (escala log-log)</text>
        <path d={rutaU} fill="none" stroke="#34d399" strokeWidth="3.2" filter={glowUrl} />
        <circle cx={mapLogH(-5)} cy={mapLogE(-10.5)} r="6" fill="#38bdf8" />
        <text x={mapLogH(-5)} y={mapLogE(-10.5) - 14} fill="#7dd3fc" fontSize="12.5" textAnchor="middle" fontFamily="monospace">
          óptimo h ≈ 10⁻⁵
        </text>
        <circle cx={mapLogH(lhActual)} cy={mapLogE(leActual)} r="7" fill="#f87171" />
      </g>
    )
  }

  const mapX = (t: number) => interpolate(t, [0, 2], [110, 740])
  const mapY = (y: number) => interpolate(y, [0, 5.4], [440, 112])
  const r = (t: number) => t * t + 1
  const nSub = visual === 'm4-ordenes' ? (p < 0.45 ? 2 : p < 0.78 ? 4 : 8) : 4
  const h = 2 / nSub
  const visibles = Math.max(1, Math.ceil(p * nSub))
  const esSimpson = visual === 'm4-simpson' || visual === 'm4-ordenes'

  const esSimpsonSolo = visual === 'm4-simpson'
  const esSimpsonComparado = visual === 'm4-ordenes'
  const pesosSimpson = [1, 4, 2, 4, 1]
  const arcosSimpson = [0, 1].map((parIdx) => {
    const t0 = parIdx
    const tMid = parIdx + 0.5
    const t2 = parIdx + 1
    const y0 = r(t0)
    const yMid = r(tMid)
    const y2 = r(t2)
    // Parábola interpolante de Lagrange en [t0, tMid, t2]
    const parab = (t: number) => {
      const l0 = ((t - tMid) * (t - t2)) / ((t0 - tMid) * (t0 - t2))
      const l1 = ((t - t0) * (t - t2)) / ((tMid - t0) * (tMid - t2))
      const l2 = ((t - t0) * (t - tMid)) / ((t2 - t0) * (t2 - tMid))
      return y0 * l0 + yMid * l1 + y2 * l2
    }
    const pts: string[] = [`M ${mapX(t0).toFixed(1)} 440`]
    const muestras = 24
    for (let s = 0; s <= muestras; s++) {
      const t = t0 + ((t2 - t0) * s) / muestras
      pts.push(`L ${mapX(t).toFixed(1)} ${mapY(parab(t)).toFixed(1)}`)
    }
    pts.push(`L ${mapX(t2).toFixed(1)} 440 Z`)
    return {
      parIdx,
      tMid,
      yMid,
      pathD: pts.join(' '),
      activo: parIdx === 0 ? p >= 0.08 : p >= 0.45,
    }
  })

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {esSimpsonSolo
          ? 'Simpson 1/3 O(h⁴): arcos parabólicos y pesos (1, 4, 2, 4, 1) en [0, 2]'
          : esSimpsonComparado
            ? `Simpson 1/3 O(h⁴) vs Trapecio O(h²) en r(t) = t² + 1 (n = ${nSub})`
            : `Trapecio compuesto bajo r(t) = t² + 1 en [0, 2] (h = ${h})`}
      </text>
      <line x1="100" y1="440" x2="755" y2="440" stroke="#475569" strokeWidth="1.8" />

      {esSimpsonSolo
        ? arcosSimpson.map((arco) => (
            <g key={arco.parIdx} opacity={arco.activo ? 1 : 0.16}>
              <path
                d={arco.pathD}
                fill={arco.parIdx === 0 ? 'rgba(52, 211, 153, 0.28)' : 'rgba(16, 185, 129, 0.22)'}
                stroke="#34d399"
                strokeWidth="2.2"
              />
              <line
                x1={mapX(arco.tMid)}
                y1="440"
                x2={mapX(arco.tMid)}
                y2={mapY(arco.yMid)}
                stroke="#6ee7b7"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            </g>
          ))
        : Array.from({ length: nSub }, (_, i) => {
            const t0 = i * h
            const t1 = (i + 1) * h
            const activo = i < visibles
            return (
              <polygon
                key={i}
                points={`${mapX(t0)},440 ${mapX(t0)},${mapY(r(t0))} ${mapX(t1)},${mapY(r(t1))} ${mapX(t1)},440`}
                fill="rgba(56, 189, 248, 0.25)"
                stroke="#38bdf8"
                strokeWidth="1.6"
                opacity={activo ? 1 : 0.14}
              />
            )
          })}

      {esSimpsonComparado &&
        arcosSimpson.map((arco) => (
          <path
            key={`cmp-${arco.parIdx}`}
            d={arco.pathD}
            fill="rgba(52, 211, 153, 0.12)"
            stroke="#34d399"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        ))}

      <path d={muestrearRuta(r, 0, 2, mapX, mapY, 80)} fill="none" stroke="#f59e0b" strokeWidth="3.5" filter={glowUrl} />

      {[0, 0.5, 1, 1.5, 2].map((t, idx) => (
        <g key={t}>
          <circle cx={mapX(t)} cy={mapY(r(t))} r="5" fill="#f8fafc" />
          {esSimpsonSolo && (
            <g>
              <rect x={mapX(t) - 18} y={mapY(r(t)) - 32} width="36" height="20" rx="6" fill="#064e3b" stroke="#34d399" />
              <text x={mapX(t)} y={mapY(r(t)) - 18} fill="#6ee7b7" fontSize="11.5" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                ×{pesosSimpson[idx]}
              </text>
            </g>
          )}
          <text x={mapX(t)} y="464" fill="#94a3b8" fontSize="13" textAnchor="middle" fontFamily="monospace">
            t={t}
          </text>
        </g>
      ))}

      <rect x="768" y="128" width="138" height="210" rx="12" fill="#0b1324" stroke="#334155" />
      <text x="784" y="160" fill="#e2e8f0" fontSize="14" fontWeight="700">Precisión</text>
      <text x="784" y="198" fill="#38bdf8" fontSize="13.5" fontFamily="monospace">T₄ = 4.7500</text>
      <text x="784" y="232" fill="#34d399" fontSize="13.5" fontFamily="monospace">S₄ = 4.6667</text>
      <text x="784" y="274" fill="#fbbf24" fontSize="13" fontFamily="monospace">Exacta: 14/3</text>
      <text x="784" y="308" fill="#94a3b8" fontSize="12">{esSimpson ? 'h ÷ 2 → err ÷ 16' : 'h ÷ 2 → err ÷ 4'}</text>
    </g>
  )
}

function EscenarioDiferenciales({ visual, p, frame, glowUrl }: PropsSubEscenario) {
  const entrada = spring({ frame, fps: 60 })
  const Ta = 20
  const k = 0.5
  const exacta = (t: number) => Ta + 60 * Math.exp(-k * t)
  const fDeriv = (T: number) => -k * (T - Ta)

  const esInestable = visual === 'm5-estabilidad' || visual === 'm5-fisica'

  if (esInestable) {
    const mapT = (t: number) => interpolate(t, [0, 15], [96, 860])
    const mapY = (y: number) => interpolate(y, [-200, 180], [450, 112])
    const h = visual === 'm5-estabilidad' ? 5 : 3
    const R = 1 - k * h
    const pts: [number, number][] = [[0, 80]]
    for (let i = 1; i <= (visual === 'm5-estabilidad' ? 3 : 5); i++) {
      const prev = pts[i - 1][1]
      pts.push([i * h, Ta + R * (prev - Ta)])
    }
    const maxSeg = interpolate(p, [0.1, 0.88], [0, pts.length - 1])
    const dEuler: string[] = [`M ${mapT(0).toFixed(1)} ${mapY(80).toFixed(1)}`]
    for (let i = 1; i < pts.length; i++) {
      if (maxSeg >= i) dEuler.push(`L ${mapT(pts[i][0]).toFixed(1)} ${mapY(pts[i][1]).toFixed(1)}`)
      else if (maxSeg > i - 1) {
        const f = maxSeg - (i - 1)
        const it = pts[i - 1][0] + f * (pts[i][0] - pts[i - 1][0])
        const iy = pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1])
        dEuler.push(`L ${mapT(it).toFixed(1)} ${mapY(iy).toFixed(1)}`)
      }
    }

    return (
      <g opacity={entrada}>
        <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
          {visual === 'm5-estabilidad'
            ? 'Inestabilidad numérica: h = 5 min → |1 − kh| = 1.5 > 1 (explosión)'
            : 'Estable pero no físico: h = 3 min → R = −0.5 cruza por debajo de Tₐ = 20°C'}
        </text>
        <line x1="96" y1={mapY(20)} x2="860" y2={mapY(20)} stroke="#64748b" strokeDasharray="6 4" strokeWidth="1.8" />
        <text x="868" y={mapY(20) + 4} fill="#94a3b8" fontSize="12.5">Tₐ=20°C</text>

        <path d={muestrearRuta(exacta, 0, 15, mapT, mapY, 80)} fill="none" stroke="#34d399" strokeWidth="3" />
        <path d={dEuler.join(' ')} fill="none" stroke="#f87171" strokeWidth="3.2" filter={glowUrl} />
        {pts.map(([t, temp], idx) => (
          maxSeg >= idx - 0.1 ? (
            <circle key={idx} cx={mapT(t)} cy={mapY(temp)} r="6" fill="#f87171" />
          ) : null
        ))}
        <text x="580" y="148" fill="#fca5a5" fontSize="15.5" fontWeight="700" fontFamily="monospace">
          R = 1 − k·h = {R.toFixed(1)} ({Math.abs(R) > 1 ? 'divergente' : 'oscilación no física'})
        </text>
      </g>
    )
  }

  // m5-modelo / m5-euler / m5-rk4: Campo de direcciones + Euler + 4 pendientes RK4
  const mapT = (t: number) => interpolate(t, [0, 2.2], [96, 845])
  const mapY = (y: number) => interpolate(y, [18, 86], [445, 112])
  const trazaProgress = interpolate(p, [0.08, 0.85], [0, 1], { easing: Easing.easeOutCubic })

  // Campo de direcciones
  const flechas: { tx: number; ty: number; dx: number; dy: number }[] = []
  for (let t = 0.2; t <= 2.0; t += 0.36) {
    for (let temp = 28; temp <= 80; temp += 10) {
      const slope = fDeriv(temp)
      const angle = Math.atan2(-(slope * 1.15), 24)
      flechas.push({
        tx: mapT(t),
        ty: mapY(temp),
        dx: Math.cos(angle) * 14,
        dy: Math.sin(angle) * 14,
      })
    }
  }

  const eulerPts: [number, number][] = [
    [0, 80],
    [0.5, 65],
    [1.0, 53.75],
    [1.5, 45.3125],
    [2.0, 38.9844],
  ]

  return (
    <g opacity={entrada}>
      <text x="64" y="88" fill="#7dd3fc" fontSize="18" fontWeight="700">
        {visual === 'm5-rk4'
          ? 'Runge-Kutta 4 (RK4): cuatro pendientes (k₁, k₂, k₃, k₄) en el primer paso h = 0.5'
          : 'Campo de direcciones de T′ = −0.5(T − 20): solución exacta vs Euler'}
      </text>

      {/* Vectores del campo de pendientes */}
      {flechas.map((fl, i) => (
        <line
          key={i}
          x1={fl.tx - fl.dx * 0.5}
          y1={fl.ty - fl.dy * 0.5}
          x2={fl.tx + fl.dx * 0.5}
          y2={fl.ty + fl.dy * 0.5}
          stroke="#334155"
          strokeWidth="1.6"
        />
      ))}

      <line x1="96" y1={mapY(20)} x2="850" y2={mapY(20)} stroke="#64748b" strokeDasharray="5 4" strokeWidth="1.5" />
      <text x="854" y={mapY(20) + 4} fill="#94a3b8" fontSize="12">Tₐ = 20°C</text>

      {/* Curva exacta */}
      <path d={muestrearRuta(exacta, 0, 2.05, mapT, mapY, 80)} fill="none" stroke="#34d399" strokeWidth="3.5" filter={glowUrl} />

      {/* Euler paso a paso */}
      <polyline
        points={eulerPts.map(([t, y]) => `${mapT(t).toFixed(1)},${mapY(y).toFixed(1)}`).join(' ')}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.8"
        pathLength={400}
        strokeDasharray="400"
        strokeDashoffset={400 * (1 - trazaProgress)}
      />

      {/* Pendientes k1..k4 para RK4 */}
      {visual === 'm5-rk4' && (
        <g>
          {[
            { t: 0.0, y: 80, kVal: -30, nombre: 'k₁', col: '#f59e0b', umbral: 0.1 },
            { t: 0.25, y: 72.5, kVal: -26.25, nombre: 'k₂', col: '#38bdf8', umbral: 0.3 },
            { t: 0.25, y: 73.44, kVal: -26.72, nombre: 'k₃', col: '#a78bfa', umbral: 0.5 },
            { t: 0.5, y: 66.64, kVal: -23.32, nombre: 'k₄', col: '#34d399', umbral: 0.7 },
          ].map((item) => {
            const visible = p >= item.umbral
            const cx = mapT(item.t)
            const cy = mapY(item.y)
            return (
              <g key={item.nombre} opacity={visible ? 1 : 0.18}>
                <line x1={cx - 24} y1={cy - item.kVal * 0.75} x2={cx + 28} y2={cy + item.kVal * 0.75} stroke={item.col} strokeWidth="3" />
                <circle cx={cx} cy={cy} r="5.5" fill={item.col} />
                <text x={cx + 14} y={cy - 10} fill={item.col} fontSize="13.5" fontWeight="700" fontFamily="monospace">
                  {item.nombre}={item.kVal}
                </text>
              </g>
            )
          })}
          <circle cx={mapT(0.5)} cy={mapY(66.728516)} r="7.5" fill="#34d399" stroke="#ecfdf5" strokeWidth="2" />
          <text x={mapT(0.5) + 18} y={mapY(66.728516) + 22} fill="#6ee7b7" fontSize="14.5" fontWeight="700" fontFamily="monospace">
            RK4 T₁ = 66.7285 °C
          </text>
        </g>
      )}
    </g>
  )
}

export default function VideoEscenarios({
  modulo,
  visual,
  progreso,
  duracion,
  escenaIdx,
  totalEscenas,
}: PropsEscenario) {
  const uid = useId().replace(/:/g, '')
  const glowId = `${uid}-glow`
  const glowUrl = `url(#${glowId})`
  const p = clamp(progreso, 0, 1)
  const frame = progresoAFrame(p, duracion, 60)

  return (
    <svg
      className="video-svg"
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={`Animación matemática interactiva de ${modulo}: ${visual}`}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#060a14" />
          <stop offset="55%" stopColor="#0b1324" />
          <stop offset="100%" stopColor="#08101e" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`} cx="75%" cy="18%" r="55%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.16)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
        </radialGradient>
        <filter id={glowId} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Fondo de estudio matemático 16:9 */}
      <rect width={ANCHO} height={ALTO} fill={`url(#${uid}-bg)`} />
      <rect width={ANCHO} height={ALTO} fill={`url(#${uid}-halo)`} />

      {/* Rejilla de fondo sutil */}
      <g stroke="#162136" strokeWidth="1" opacity="0.65">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`vx-${i}`} x1={i * 64} y1="0" x2={i * 64} y2={ALTO} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`hy-${i}`} x1="0" y1={i * 68} x2={ANCHO} y2={i * 68} />
        ))}
      </g>

      {/* Barra HUD superior dentro del lienzo 16:9 */}
      <g>
        <rect x="28" y="20" width="904" height="36" rx="10" fill="rgba(15, 23, 42, 0.78)" stroke="rgba(148, 163, 184, 0.22)" />
        <text x="46" y="43" fill="#e2e8f0" fontSize="13.5" fontWeight="700" fontFamily="monospace">
          LABORATORIO HD · {modulo.toUpperCase()} · ESCENA {escenaIdx + 1}/{totalEscenas}
        </text>
        <text x="912" y="43" fill="#34d399" fontSize="13" fontWeight="700" textAnchor="end" fontFamily="monospace">
          60 FPS · f {Math.round(frame)} · {(p * 100).toFixed(0)}%
        </text>
      </g>

      {/* Escena matemática continua */}
      {modulo === 'errores' && <EscenarioErrores visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}
      {modulo === 'ecuaciones' && <EscenarioEcuaciones visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}
      {modulo === 'sistemas' && <EscenarioSistemas visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}
      {modulo === 'interpolacion' && <EscenarioInterpolacion visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}
      {modulo === 'integracion' && <EscenarioIntegracion visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}
      {modulo === 'diferenciales' && <EscenarioDiferenciales visual={visual} p={p} frame={frame} glowUrl={glowUrl} />}

      {/* Barra de progreso micro-integrada en la base del lienzo */}
      <rect x="28" y="504" width="904" height="4" rx="2" fill="rgba(148, 163, 184, 0.2)" />
      <rect x="28" y="504" width={904 * p} height="4" rx="2" fill="#38bdf8" />
    </svg>
  )
}
