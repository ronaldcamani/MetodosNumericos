import { Link } from 'react-router-dom'
import CaritaEstado, { type EstadoCarita } from '../components/CaritaEstado'
import Estrellas from '../components/Estrellas'
import Matematica from '../components/Matematica'
import { useProgreso, useProgresoTodos } from '../components/useProgreso'
import { LECCIONES_VIDEO, type ModuloVideoId } from '../core/lecciones'
import { NIVELES } from '../core/practica/base'
import { dominio, estrellas, etiquetaDominio, PROGRESO_VACIO } from '../core/practica/progreso'
import { ETIQUETA_ESTADO_SILABO, MODULOS, TOTAL_TEMAS_SILABO } from '../modules/registro'

const M = Matematica

interface MetadataTema {
  numero: string
  area: string
  tex: string
  videoId: ModuloVideoId
}

const INSIGNIA_TEMA: Record<string, MetadataTema> = {
  errores: {
    numero: '01',
    area: 'Precisión y propagación',
    tex: String.raw`E_{rel} = \frac{|x - \tilde x|}{|x|}`,
    videoId: 'errores',
  },
  ecuaciones: {
    numero: '02',
    area: 'Búsqueda de raíces',
    tex: String.raw`x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}`,
    videoId: 'ecuaciones',
  },
  sistemas: {
    numero: '03',
    area: 'Álgebra lineal numérica',
    tex: String.raw`A\mathbf{x} = \mathbf{b},\; |a_{ii}| > \sum_{j\neq i}|a_{ij}|`,
    videoId: 'sistemas',
  },
  interpolacion: {
    numero: '04',
    area: 'Ajuste y polinomios',
    tex: String.raw`P(x) = \sum_{i=0}^{n-1} y_i L_i(x)`,
    videoId: 'interpolacion',
  },
  integracion: {
    numero: '05',
    area: 'Cuadratura y derivadas',
    tex: String.raw`S_n = \frac{h}{3}\bigl[f_0 + 4f_1 + 2f_2 + \dots + f_n\bigr]`,
    videoId: 'integracion',
  },
  diferenciales: {
    numero: '06',
    area: 'Sistemas dinámicos',
    tex: String.raw`T_{n+1} = T_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)`,
    videoId: 'diferenciales',
  },
}

const FORMULAS_VITRINA = [
  { etiqueta: 'Convergencia p = 2', tex: String.raw`x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}` },
  { etiqueta: 'Cuadratura compuesta', tex: String.raw`\int_a^b f(x)\,dx` },
  { etiqueta: 'Modelo dinámico', tex: String.raw`T' = -k(T - T_a)` },
] as const

const PASOS_APRENDIZAJE = [
  {
    numero: '01',
    titulo: 'Explora y Decide',
    descripcion: 'Diagnostica el problema antes de calcular: continuidad, dominancia diagonal, ruido o tamaño de paso.',
    icono: 'decidir',
  },
  {
    numero: '02',
    titulo: 'Mira la Video-Lección Narrada',
    descripcion: 'Sigue un ejercicio completo de 2 a 3 minutos en 60 FPS con voz neuronal, KaTeX y tablas paso a paso.',
    icono: 'video',
  },
  {
    numero: '03',
    titulo: 'Experimenta en la Calculadora y Convergencia',
    descripcion: 'Edita coeficientes, fuerza casos límite y mide el orden de convergencia en gráficas interactivas.',
    icono: 'lab',
  },
  {
    numero: '04',
    titulo: 'Razonamiento Guiado con Tutor Socrático',
    descripcion: 'Practica por niveles con pistas socráticas que detectan trampas numéricas y registran tu dominio local.',
    icono: 'tutor',
  },
] as const

function duracionVideoSeg(videoId: ModuloVideoId): number {
  return LECCIONES_VIDEO[videoId].escenas.reduce((acc, esc) => acc + esc.duracion, 0)
}

function fmtDuracionVideo(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = Math.round(seg % 60)
  return `${m}:${s.toString().padStart(2, '0')} min`
}

function estadoAvance(pct: number, estudiados: number): EstadoCarita {
  if (pct >= 80) return 'excelente'
  if (pct >= 40) return 'bien'
  if (estudiados > 0 || pct > 0) return 'aprendiendo'
  return 'analizando'
}

function IconoPlay() {
  return (
    <svg className="icono-svg" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.6 5.4L11 8L6.6 10.6V5.4Z" fill="currentColor" />
    </svg>
  )
}

function IconoPaso({ tipo }: { tipo: (typeof PASOS_APRENDIZAJE)[number]['icono'] }) {
  if (tipo === 'decidir') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v5m0 0l-5 5m5-5l5 5M5 17h4m6 0h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    )
  }
  if (tipo === 'video') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 9.2L15.2 12L10 14.8V9.2Z" fill="currentColor" />
      </svg>
    )
  }
  if (tipo === 'lab') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19h16M5 16c2.5-6 5.5-9 10-9 2 0 3.5 1 4 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="15" cy="7" r="2" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IlustracionModulo({ id }: { id: string }) {
  return (
    <div className="tarjeta-ilustracion" aria-hidden="true">
      <svg viewBox="0 0 240 72" fill="none" className="tarjeta-svg">
        <line x1="10" y1="58" x2="230" y2="58" stroke="var(--border-hairline)" strokeWidth="1" />
        <line x1="10" y1="36" x2="230" y2="36" stroke="var(--border-hairline)" strokeDasharray="3 3" strokeWidth="1" />
        {id === 'errores' && (
          <>
            <line x1="24" y1="42" x2="216" y2="42" stroke="var(--border-strong)" strokeWidth="1.6" />
            {[40, 80, 120, 160, 200].map((x) => (
              <line key={x} x1={x} y1="36" x2={x} y2="48" stroke="var(--muted)" strokeWidth="1.2" />
            ))}
            <rect x="108" y="25" width="44" height="34" rx="5" fill="var(--accent-soft)" stroke="var(--accent-border)" />
            <circle cx="130" cy="42" r="4.5" fill="var(--ok)" />
            <circle cx="145" cy="42" r="4" fill="var(--estrella)" />
            <path d="M130 20H145" stroke="var(--acento)" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {id === 'ecuaciones' && (
          <>
            <path d="M24 58 C64 56, 108 46, 140 36 C168 27, 192 16, 214 10" stroke="var(--acento)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="186" y1="20" x2="112" y2="58" stroke="var(--estrella)" strokeWidth="1.8" strokeDasharray="4 3" />
            <circle cx="186" cy="20" r="4" fill="var(--estrella)" />
            <circle cx="140" cy="36" r="4.5" fill="var(--ok)" />
          </>
        )}
        {id === 'sistemas' && (
          <>
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => {
                const diag = r === c && c < 3
                const rhs = c === 3
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={44 + c * 36 + (rhs ? 12 : 0)}
                    y={10 + r * 19}
                    width="28"
                    height="14"
                    rx="4"
                    fill={diag ? 'var(--accent-soft)' : rhs ? 'var(--ok-bg)' : 'var(--surface-subtle)'}
                    stroke={diag ? 'var(--acento)' : rhs ? 'var(--ok)' : 'var(--border-strong)'}
                    strokeWidth="1.2"
                  />
                )
              }),
            )}
          </>
        )}
        {id === 'interpolacion' && (
          <>
            <line x1="22" y1="54" x2="218" y2="18" stroke="var(--estrella)" strokeWidth="1.8" strokeDasharray="5 4" />
            <path d="M24 56 C62 28, 102 42, 134 38 C164 34, 188 18, 214 14" stroke="var(--acento)" strokeWidth="2.3" strokeLinecap="round" />
            {[
              [34, 50],
              [86, 36],
              [148, 36],
              [204, 16],
            ].map(([cx, cy], idx) => (
              <circle key={idx} cx={cx} cy={cy} r="4.2" fill="var(--card)" stroke="var(--acento)" strokeWidth="2" />
            ))}
          </>
        )}
        {id === 'integracion' && (
          <>
            <path d="M36 58 L36 44 Q82 40 120 30 Q162 19 204 12 L204 58 Z" fill="var(--accent-soft)" />
            {[36, 78, 120, 162].map((x, idx) => (
              <line key={x} x1={x} y1="58" x2={x} y2={44 - idx * 8} stroke="var(--accent-border)" strokeWidth="1.2" />
            ))}
            <path d="M36 44 Q120 31 204 12" stroke="var(--acento)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="120" cy="30" r="4" fill="var(--ok)" />
          </>
        )}
        {id === 'diferenciales' && (
          <>
            {[42, 86, 130, 174].map((x) =>
              [18, 34, 50].map((y) => (
                <line
                  key={`${x}-${y}`}
                  x1={x - 6}
                  y1={y - 3}
                  x2={x + 6}
                  y2={y + 3}
                  stroke="var(--border-strong)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              )),
            )}
            <path d="M24 14 C70 28, 128 45, 216 53" stroke="var(--ok)" strokeWidth="2.4" strokeLinecap="round" />
            <polyline points="24,14 78,34 136,47 216,55" stroke="var(--estrella)" strokeWidth="1.7" strokeDasharray="4 3" />
          </>
        )}
      </svg>
    </div>
  )
}

/** Avance del estudiante en el tema: se llena al resolver la práctica por niveles. */
function AvanceTema({ tema }: { tema: string }) {
  const { progreso: p } = useProgreso(tema)
  const pct = dominio(p)
  const total = NIVELES.reduce((s, n) => s + estrellas(p.correctas[n]), 0)
  const estado = estadoAvance(pct, p.estudiados.length)
  return (
    <div className="avance-tarjeta">
      <div className="avance-tarjeta-top">
        <CaritaEstado estado={estado} compacto />
        <span className="avance-porcentaje">{pct} %</span>
      </div>
      <span className="barra" role="progressbar" aria-label={`Dominio de ${tema}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </span>
      <p className="avance-meta">
        <span>{etiquetaDominio(pct)} · {pct} %</span>
        <span>
          <Estrellas n={Math.min(3, Math.round(total / 3))} /> · {p.puntos} puntos
        </span>
      </p>
    </div>
  )
}

export default function Inicio() {
  const todos = useProgresoTodos()

  const resumenProgreso = MODULOS.map((m) => {
    const p = todos[m.id] ?? PROGRESO_VACIO()
    return { modulo: m, pct: dominio(p), estudiados: p.estudiados.length, puntos: p.puntos }
  })

  const progresoGlobal = Math.round(
    resumenProgreso.reduce((s, x) => s + x.pct, 0) / Math.max(1, resumenProgreso.length),
  )

  const totalVideoMin = Math.round(
    MODULOS.reduce((acc, m) => {
      const meta = INSIGNIA_TEMA[m.id]
      return acc + (meta ? duracionVideoSeg(meta.videoId) : 0)
    }, 0) / 60,
  )

  const temasActivosSilabo = MODULOS.reduce(
    (acc, m) => acc + m.silabo.temas.filter((t) => t.estado === 'implementado').length,
    0,
  )

  const moduloEnCurso = resumenProgreso.find(
    (x) => (x.pct > 0 && x.pct < 100) || (x.estudiados > 0 && x.pct < 100),
  )
  const primerPendiente = resumenProgreso.find((x) => x.pct < 100)
  const sugerido = moduloEnCurso ?? primerPendiente ?? resumenProgreso[resumenProgreso.length - 1]
  const metaSugerido = INSIGNIA_TEMA[sugerido.modulo.id] ?? INSIGNIA_TEMA.errores
  const etiquetaRuta = moduloEnCurso
    ? 'Continuar aprendiendo'
    : primerPendiente
      ? 'Ruta recomendada'
      : 'Ruta completada · Repaso'

  return (
    <div className="portal-inicio">
      <section className="hero-portal" aria-label="Introducción al laboratorio">
        <div className="hero-portal-cuerpo">
          <span className="hero-badge">
            <span className="hero-badge-punto" aria-hidden="true" />
            UNSA · Ingeniería de Sistemas · Sílabo Oficial 2026-B (1703244)
          </span>
          <h1>Portal de Métodos Numéricos</h1>
          <p className="hero-lead">
            Organizado al pie de la letra según las 5 Unidades, 6 Capítulos y 16 Temas del sílabo oficial (1703244). Domina cada algoritmo paso a paso, contrasta su convergencia y valida cada método con casos interactivos. ¿Primera vez aquí? Revisa{' '}
            <Link to="/recursos">cómo estudiar un tema</Link>.
          </p>

          <dl className="hero-metricas" aria-label="Métricas del laboratorio">
            <div className="hero-metrica">
              <dt>Sílabo 2026-B</dt>
              <dd>5 Unid. · 6 Cap.</dd>
            </div>
            <div className="hero-metrica">
              <dt>Temas oficiales</dt>
              <dd>{temasActivosSilabo} / {TOTAL_TEMAS_SILABO} activos</dd>
            </div>
            <div className="hero-metrica">
              <dt>Video-lecciones</dt>
              <dd>{MODULOS.length} · {totalVideoMin} min</dd>
            </div>
            <div className="hero-metrica">
              <dt>Práctica</dt>
              <dd>Tutor Socrático</dd>
            </div>
            <div className="hero-metrica hero-metrica-destacada">
              <dt>Progreso global</dt>
              <dd>{progresoGlobal} %</dd>
            </div>
          </dl>
        </div>

        <aside className="hero-vitrina" aria-label="Ruta recomendada y fórmulas clave">
          <div className="hero-formulas-flotantes" aria-hidden="true">
            {FORMULAS_VITRINA.map((item) => (
              <div key={item.etiqueta} className="hero-formula-chip">
                <span className="hero-formula-tag">{item.etiqueta}</span>
                <M tex={item.tex} />
              </div>
            ))}
          </div>

          <div className="hero-ruta">
            <div className="hero-ruta-top">
              <span className="hero-ruta-badge">{etiquetaRuta}</span>
              <span className="hero-ruta-duracion">
                <IconoPlay />
                {fmtDuracionVideo(duracionVideoSeg(metaSugerido.videoId))}
              </span>
            </div>
            <p className="hero-ruta-titulo">
              {metaSugerido.numero} · {sugerido.modulo.titulo}
            </p>
            <p className="hero-ruta-desc">{sugerido.modulo.descripcion}</p>
            <div className="hero-ruta-progreso" aria-hidden="true">
              <div className="hero-ruta-barra">
                <span style={{ width: `${sugerido.pct}%` }} />
              </div>
              <span className="hero-ruta-pct">{sugerido.pct} % dominio</span>
            </div>
            <div className="hero-ruta-acciones">
              <Link className="hero-ruta-cta" to={sugerido.modulo.ruta}>
                {moduloEnCurso ? 'Continuar ruta' : 'Comenzar ruta'} →
              </Link>
              <span className="hero-ruta-area">{metaSugerido.area}</span>
            </div>
          </div>
        </aside>
      </section>

      <ul className="tarjetas" aria-label="Módulos de Métodos Numéricos">
        {MODULOS.map((m) => {
          const insignia = INSIGNIA_TEMA[m.id] ?? INSIGNIA_TEMA.errores
          const duracionMin = fmtDuracionVideo(duracionVideoSeg(insignia.videoId))
          return (
            <li key={m.id} className="tarjeta" data-tema={m.id}>
              <div className="tarjeta-cabecera">
                <div className="tarjeta-identidad">
                  <span className="tarjeta-numero">{m.silabo.unidadCorta}</span>
                  <span className="tarjeta-area">{m.silabo.capitulo}</span>
                </div>
                <span className="tarjeta-video-badge" title="Incluye video-lección narrada">
                  <IconoPlay />
                  {duracionMin}
                </span>
              </div>

              <IlustracionModulo id={m.id} />

              <h2>{m.titulo}</h2>

              <div className="tarjeta-formula">
                <M tex={insignia.tex} />
              </div>

              <p className="tarjeta-desc">{m.descripcion}</p>

              <div className="tarjeta-silabo" aria-label={`Temas del sílabo para ${m.titulo}`}>
                <p className="tarjeta-silabo-titulo">
                  {m.silabo.unidad} — {m.silabo.capitulo}
                </p>
                <ul className="tarjeta-silabo-lista">
                  {m.silabo.temas.map((tema) => (
                    <li key={tema.numero} className="tarjeta-silabo-item">
                      <span className="tarjeta-silabo-tema">
                        <strong>{tema.numero}:</strong> {tema.titulo}
                      </span>
                      <span className={`silabo-badge silabo-badge-${tema.estado}`}>
                        {ETIQUETA_ESTADO_SILABO[tema.estado]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="tarjeta-chips" aria-label={`Métodos de ${m.titulo}`}>
                {m.metodos.map((met) => (
                  <li key={met}>{met}</li>
                ))}
              </ul>

              {m.disponible && <AvanceTema tema={m.id} />}

              <div className="tarjeta-pie">
                {m.disponible ? (
                  <Link className="tarjeta-cta" to={m.ruta}>Abrir tema</Link>
                ) : (
                  <span className="pendiente">En preparación</span>
                )}
                {m.subpaginas && (
                  <ul className="tarjeta-subpaginas" aria-label={`Páginas de ${m.titulo}`}>
                    {m.subpaginas.map((p) => (
                      <li key={p.ruta}>
                        <Link to={p.ruta}>{p.titulo}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <section className="flujo-aprendizaje" aria-label="Cómo aprender en este portal">
        <div className="flujo-cabecera">
          <p className="flujo-eyebrow">Metodología de estudio</p>
          <p className="flujo-titulo">Cómo aprender en este portal</p>
          <p className="flujo-subtitulo">
            Un recorrido diseñado para pasar de la intuición geométrica al criterio numérico sólido antes de calcular.
          </p>
        </div>

        <ol className="flujo-grid">
          {PASOS_APRENDIZAJE.map((paso) => (
            <li key={paso.numero} className="flujo-paso">
              <div className="flujo-paso-top">
                <span className="flujo-icono">
                  <IconoPaso tipo={paso.icono} />
                </span>
                <span className="flujo-num">{paso.numero}</span>
              </div>
              <h3>{paso.titulo}</h3>
              <p>{paso.descripcion}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
