import { useEffect, useState } from 'react'

export type PrefTema = 'auto' | 'claro' | 'oscuro'
const CLAVE = 'tema-preferido'

function leerPref(): PrefTema {
  try {
    const v = localStorage.getItem(CLAVE)
    if (v === 'claro' || v === 'oscuro') return v
  } catch { /* sin almacenamiento: se usa el tema del dispositivo */ }
  return 'auto'
}

function sistemaOscuro(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}

/** Aplica la preferencia al <html>: sin atributo se sigue al dispositivo. */
function aplicar(pref: PrefTema) {
  const raiz = document.documentElement
  if (pref === 'auto') raiz.removeAttribute('data-theme')
  else raiz.setAttribute('data-theme', pref === 'oscuro' ? 'dark' : 'light')
}

export function useTema() {
  const [pref, setPref] = useState<PrefTema>(leerPref)
  const [sisOscuro, setSisOscuro] = useState(sistemaOscuro)

  useEffect(() => {
    aplicar(pref)
    try {
      if (pref === 'auto') localStorage.removeItem(CLAVE)
      else localStorage.setItem(CLAVE, pref)
    } catch { /* ignorar */ }
  }, [pref])

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const f = () => setSisOscuro(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  const oscuro = pref === 'oscuro' || (pref === 'auto' && sisOscuro)
  return { pref, setPref, oscuro }
}
