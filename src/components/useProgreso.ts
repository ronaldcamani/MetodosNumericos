import { useCallback, useSyncExternalStore } from 'react'
import { marcarEstudiado, normalizar, registrarIntento, type ProgresoTema, type Resultado } from '../core/practica/progreso'

const CLAVE = 'portal-mn-progreso-v1'
type Todo = Record<string, ProgresoTema>

let memoria: Todo | null = null
const oyentes = new Set<() => void>()

function leer(): Todo {
  if (memoria) return memoria
  let crudo: Record<string, unknown> = {}
  try {
    const t = window.localStorage.getItem(CLAVE)
    if (t) crudo = JSON.parse(t) as Record<string, unknown>
  } catch { /* sin almacenamiento o JSON dañado: se empieza de cero */ }
  memoria = Object.fromEntries(Object.entries(crudo).map(([k, v]) => [k, normalizar(v)]))
  return memoria
}

function guardar(sig: Todo) {
  memoria = sig
  try { window.localStorage.setItem(CLAVE, JSON.stringify(sig)) } catch { /* el avance dura mientras la pestaña siga abierta */ }
  oyentes.forEach((f) => f())
}

const suscribir = (f: () => void) => {
  oyentes.add(f)
  const alStorage = (e: StorageEvent) => { if (e.key === CLAVE) { memoria = null; f() } }
  window.addEventListener('storage', alStorage)
  return () => { oyentes.delete(f); window.removeEventListener('storage', alStorage) }
}

/** Solo para pruebas: olvida el avance en memoria y en el almacenamiento. */
export function borrarProgreso() {
  memoria = {}
  try { window.localStorage.removeItem(CLAVE) } catch { /* nada que borrar */ }
  oyentes.forEach((f) => f())
}

export function useProgresoTodos(): Todo {
  return useSyncExternalStore(suscribir, leer)
}

export function useProgreso(tema: string) {
  const todos = useProgresoTodos()
  const actual = todos[tema] ?? normalizar(null)
  const registrar = useCallback((r: Resultado) => {
    const t = leer()
    guardar({ ...t, [tema]: registrarIntento(t[tema] ?? normalizar(null), r) })
  }, [tema])
  const estudiado = useCallback((id: string) => {
    const t = leer()
    const p = t[tema] ?? normalizar(null)
    const sig = marcarEstudiado(p, id)
    if (sig !== p) guardar({ ...t, [tema]: sig })
  }, [tema])
  return { progreso: actual, registrar, estudiado }
}
