import { useMemo, useState } from 'react'
import { parseNumero } from '../core/entrada'
import { CATALOGOS, evaluarCampo, generarProblemas, NIVELES, PUNTOS_NIVEL, ROTULO_NIVEL, type Nivel, type Problema } from '../core/practica'
import { estrellas } from '../core/practica/progreso'
import Estrellas from './Estrellas'
import PasosOcultos from './PasosOcultos'
import ProgresoTema from './ProgresoTema'
import Texto from './Texto'
import { useProgreso } from './useProgreso'

const DESCRIPCION: Record<Nivel, string> = {
  basico: 'Aplicas una fórmula con datos sencillos.',
  intermedio: 'Combinas varios pasos y comparas con el valor exacto.',
  avanzado: 'Interpretas el resultado y detectas cuándo el método falla.',
}
const nuevaSemilla = () => Math.floor(Math.random() * 1_000_000) + 1

function Tarjeta({ p, n }: { p: Problema; n: number }) {
  const { registrar } = useProgreso(p.tema)
  const [entradas, setEntradas] = useState<string[]>(() => p.campos.map(() => ''))
  const [veredictos, setVeredictos] = useState<('correcto' | 'incorrecto')[] | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [verPasos, setVerPasos] = useState(false)
  const [vio, setVio] = useState(false)
  const acerto = veredictos !== null && veredictos.every((v) => v === 'correcto')

  const comprobar = (e: React.FormEvent) => {
    e.preventDefault()
    const nums = entradas.map(parseNumero)
    if (nums.some((x) => x === null)) { setAviso('Escribe un número en cada campo (puedes usar coma o punto decimal).'); setVeredictos(null); return }
    setAviso(null)
    const v = p.campos.map((c, i) => evaluarCampo(c, nums[i]) as 'correcto' | 'incorrecto')
    setVeredictos(v)
    registrar({ id: p.id, nivel: p.nivel, correcto: v.every((x) => x === 'correcto'), vioSolucion: vio })
  }
  const abrirPasos = () => { setVerPasos(true); if (!acerto) setVio(true) }

  return (
    <li className="problema-generado">
      <h3>Problema {n}: {p.titulo}</h3>
      <p><Texto texto={p.enunciado} /></p>
      <form onSubmit={comprobar} noValidate>
        {p.campos.map((c, i) => (
          <label key={i} className="campo">
            {c.etiqueta}
            <input inputMode="decimal" autoComplete="off" value={entradas[i]} disabled={acerto}
              onChange={(e) => { const v = [...entradas]; v[i] = e.target.value; setEntradas(v); setVeredictos(null); setAviso(null) }} />
          </label>
        ))}
        <div className="acciones">
          <button type="submit" disabled={acerto}>Comprobar mi respuesta</button>
          {!verPasos && <button type="button" onClick={abrirPasos}>Ver el desarrollo paso a paso</button>}
        </div>
      </form>
      <div role="status">
        {aviso && <p className="estado estado-error">⚠ {aviso}</p>}
        {veredictos && (
          <div className={`estado ${acerto ? 'estado-ok' : 'estado-error'}`}>
            <ul>
              {p.campos.map((c, i) => <li key={i}>{veredictos[i] === 'correcto' ? '✔' : '✖'} {c.etiqueta}: {veredictos[i] === 'correcto' ? 'correcto' : 'no coincide'}</li>)}
            </ul>
            {acerto
              ? <p><strong>¡Correcto!</strong> {vio ? 'Como viste el desarrollo antes de acertar, este problema no suma puntos.' : `+${PUNTOS_NIVEL[p.nivel]} puntos.`}</p>
              : <p>Revisa tu desarrollo y vuelve a intentarlo. No se muestra la respuesta: si lo necesitas, abre el desarrollo (ese problema ya no sumará puntos).</p>}
          </div>
        )}
      </div>
      {verPasos && (
        <>
          {!acerto && <p className="aviso">Cada paso queda oculto hasta que lo pidas: intenta adelantarte mentalmente antes de revelarlo.</p>}
          <PasosOcultos pasos={p.pasos.map((t, i) => <Texto key={i} texto={t} />)} nombre={`problema ${n}`} />
        </>
      )}
    </li>
  )
}

/** Práctica final del tema: problemas nuevos al azar por nivel; el avance queda registrado. */
export default function PracticaGenerada({ tema }: { tema: string }) {
  const [nivel, setNivel] = useState<Nivel>('basico')
  const [semilla, setSemilla] = useState(nuevaSemilla)
  const { progreso } = useProgreso(tema)
  const problemas = useMemo(() => generarProblemas(tema, nivel, CATALOGOS[tema], semilla), [tema, nivel, semilla])

  return (
    <div className="practica-generada">
      <ProgresoTema tema={tema} />
      <div role="group" aria-label="Nivel de dificultad" className="niveles">
        {NIVELES.map((n) => (
          <button key={n} type="button" aria-pressed={nivel === n} onClick={() => setNivel(n)}>
            {ROTULO_NIVEL[n]} <Estrellas n={estrellas(progreso.correctas[n])} />
          </button>
        ))}
      </div>
      <p><strong>{ROTULO_NIVEL[nivel]}.</strong> {DESCRIPCION[nivel]} Cada acierto vale {PUNTOS_NIVEL[nivel]} puntos si no abriste el desarrollo antes.</p>
      <ol className="problemas-generados" aria-label={`Problemas de nivel ${ROTULO_NIVEL[nivel].toLowerCase()}`}>
        {problemas.map((p, i) => <Tarjeta key={p.id} p={p} n={i + 1} />)}
      </ol>
      <div className="acciones">
        <button type="button" onClick={() => setSemilla(nuevaSemilla())}>Generar problemas nuevos</button>
      </div>
    </div>
  )
}
