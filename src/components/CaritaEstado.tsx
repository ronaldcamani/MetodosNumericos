import Texto from './Texto'

export type EstadoCarita = 'excelente' | 'bien' | 'analizando' | 'aprendiendo' | 'trampa'

interface InfoCarita {
  emoji: string
  titulo: string
}

export const CARITAS: Record<EstadoCarita, InfoCarita> = {
  excelente: { emoji: '🤩', titulo: 'Excelente · Al primer intento' },
  bien: { emoji: '😊', titulo: '¡Bien hecho!' },
  analizando: { emoji: '🤔', titulo: 'Analizando paso…' },
  aprendiendo: { emoji: '😅', titulo: 'Aprendiendo con guía' },
  trampa: { emoji: '🧐', titulo: '¡Cuidado con la trampa!' },
}

interface PropsCarita {
  estado: EstadoCarita
  mensaje?: string
  compacto?: boolean
}

/** Indicador expresivo del estado de comprensión del estudiante durante la práctica guiada. */
export default function CaritaEstado({ estado, mensaje, compacto = false }: PropsCarita) {
  const info = CARITAS[estado]
  return (
    <div className={`carita carita-${estado}${compacto ? ' carita-compacta' : ''}`}>
      <span key={estado} className="carita-emoji" role="img" aria-label={info.titulo}>
        {info.emoji}
      </span>
      <div className="carita-cuerpo">
        <strong className="carita-titulo">{info.titulo}</strong>
        {mensaje && (
          <p className="carita-mensaje">
            <Texto texto={mensaje} />
          </p>
        )}
      </div>
    </div>
  )
}

interface PropsBarra {
  porcentaje: number
  sinGuia: number
  conGuia: number
  total: number
  etiqueta?: string
}

function estadoPorPorcentaje(pct: number, sinGuia: number, conGuia: number): EstadoCarita {
  if (pct >= 80 && sinGuia >= conGuia) return 'excelente'
  if (pct >= 50) return 'bien'
  if (conGuia > 0) return 'aprendiendo'
  return 'analizando'
}

/** Barra visual de Nivel de Comprensión con caritas en los hitos de progreso. */
export function BarraComprension({ porcentaje, sinGuia, conGuia, total, etiqueta = 'Nivel de comprensión' }: PropsBarra) {
  const pct = Math.max(0, Math.min(100, Math.round(porcentaje)))
  const estado = estadoPorPorcentaje(pct, sinGuia, conGuia)
  return (
    <div className="comprension-box" aria-label={etiqueta}>
      <div className="comprension-cabecera">
        <span className="comprension-titulo">
          <span role="img" aria-label={CARITAS[estado].titulo}>{CARITAS[estado].emoji}</span>{' '}
          <strong>{etiqueta}:</strong> {pct} %
        </span>
        <span className="suave">
          {sinGuia} razonado{sinGuia === 1 ? '' : 's'} sin guía · {conGuia} con tutor ({total} en total)
        </span>
      </div>
      <div
        className="comprension-barra"
        role="meter"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <span className="comprension-relleno" style={{ width: `${pct}%` }} />
      </div>
      <div className="comprension-hitos" aria-hidden="true">
        <span>🤔 Explorando</span>
        <span>😅 Con guía</span>
        <span>😊 Comprendido</span>
        <span>🤩 Dominio total</span>
      </div>
    </div>
  )
}
