import { esExito, type Estado } from '../core/tipos'

/** El estado se comunica con texto e icono, no solo con color. */
export default function MensajeEstado({ estado, mensaje }: { estado: Estado; mensaje: string }) {
  const ok = esExito(estado)
  return (
    <div className={`estado ${ok ? 'estado-ok' : 'estado-error'}`} role={ok ? 'status' : 'alert'}>
      <strong>{ok ? '✔ Correcto' : estado === 'max_iter' || estado === 'no_converge' ? '⚠ Sin convergencia' : '✖ Error'}</strong>
      <span> {mensaje}</span>
      <code className="estado-codigo">{estado}</code>
    </div>
  )
}
