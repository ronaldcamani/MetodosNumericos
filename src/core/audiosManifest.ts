// Archivo generado por scripts/generar_voces.mjs — no editar manualmente las duraciones.

export type ProveedorVoz = 'elevenlabs' | 'edge-tts' | 'cache'

export interface AudioEscenaMeta {
  readonly id: string
  readonly ruta: string
  readonly duracionAudioSeg: number
  readonly duracionEscenaSeg: number
  readonly proveedor: ProveedorVoz
  readonly voz: string
  readonly bytes: number
}

export const AUDIOS_MANIFEST: Record<string, AudioEscenaMeta> = {
  'err-v1': { id: 'err-v1', ruta: 'audios/errores/escena-1.mp3', duracionAudioSeg: 15.55, duracionEscenaSeg: 18, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 93312 },
  'err-v2': { id: 'err-v2', ruta: 'audios/errores/escena-2.mp3', duracionAudioSeg: 17.95, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 107712 },
  'err-v3': { id: 'err-v3', ruta: 'audios/errores/escena-3.mp3', duracionAudioSeg: 19.87, duracionEscenaSeg: 22, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 119232 },
  'err-v4': { id: 'err-v4', ruta: 'audios/errores/escena-4.mp3', duracionAudioSeg: 19.03, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 114192 },
  'err-v5': { id: 'err-v5', ruta: 'audios/errores/escena-5.mp3', duracionAudioSeg: 12.79, duracionEscenaSeg: 15, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 76752 },
  'err-v6': { id: 'err-v6', ruta: 'audios/errores/escena-6.mp3', duracionAudioSeg: 18.05, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 108288 },
  'err-v7': { id: 'err-v7', ruta: 'audios/errores/escena-7.mp3', duracionAudioSeg: 19.68, duracionEscenaSeg: 22, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 118080 },
  'ec-v1': { id: 'ec-v1', ruta: 'audios/ecuaciones/escena-1.mp3', duracionAudioSeg: 12.17, duracionEscenaSeg: 14, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 73008 },
  'ec-v2': { id: 'ec-v2', ruta: 'audios/ecuaciones/escena-2.mp3', duracionAudioSeg: 20.35, duracionEscenaSeg: 22, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 122112 },
  'ec-v3': { id: 'ec-v3', ruta: 'audios/ecuaciones/escena-3.mp3', duracionAudioSeg: 12.48, duracionEscenaSeg: 14, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 74880 },
  'ec-v4': { id: 'ec-v4', ruta: 'audios/ecuaciones/escena-4.mp3', duracionAudioSeg: 20.98, duracionEscenaSeg: 23, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 125856 },
  'ec-v5': { id: 'ec-v5', ruta: 'audios/ecuaciones/escena-5.mp3', duracionAudioSeg: 17.26, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 103536 },
  'ec-v6': { id: 'ec-v6', ruta: 'audios/ecuaciones/escena-6.mp3', duracionAudioSeg: 20.69, duracionEscenaSeg: 23, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 124128 },
  'ec-v7': { id: 'ec-v7', ruta: 'audios/ecuaciones/escena-7.mp3', duracionAudioSeg: 19.06, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 114336 },
  'sis-v1': { id: 'sis-v1', ruta: 'audios/sistemas/escena-1.mp3', duracionAudioSeg: 16.9, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 101376 },
  'sis-v2': { id: 'sis-v2', ruta: 'audios/sistemas/escena-2.mp3', duracionAudioSeg: 19.3, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 115776 },
  'sis-v3': { id: 'sis-v3', ruta: 'audios/sistemas/escena-3.mp3', duracionAudioSeg: 18.14, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 108864 },
  'sis-v4': { id: 'sis-v4', ruta: 'audios/sistemas/escena-4.mp3', duracionAudioSeg: 13.78, duracionEscenaSeg: 16, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 82656 },
  'sis-v5': { id: 'sis-v5', ruta: 'audios/sistemas/escena-5.mp3', duracionAudioSeg: 13.85, duracionEscenaSeg: 16, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 83088 },
  'sis-v6': { id: 'sis-v6', ruta: 'audios/sistemas/escena-6.mp3', duracionAudioSeg: 17.47, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 104832 },
  'sis-v7': { id: 'sis-v7', ruta: 'audios/sistemas/escena-7.mp3', duracionAudioSeg: 18.86, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 113184 },
  'int-v1': { id: 'int-v1', ruta: 'audios/interpolacion/escena-1.mp3', duracionAudioSeg: 17.3, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 103824 },
  'int-v2': { id: 'int-v2', ruta: 'audios/interpolacion/escena-2.mp3', duracionAudioSeg: 13.15, duracionEscenaSeg: 15, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 78912 },
  'int-v3': { id: 'int-v3', ruta: 'audios/interpolacion/escena-3.mp3', duracionAudioSeg: 14.18, duracionEscenaSeg: 16, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 85104 },
  'int-v4': { id: 'int-v4', ruta: 'audios/interpolacion/escena-4.mp3', duracionAudioSeg: 18.24, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 109440 },
  'int-v5': { id: 'int-v5', ruta: 'audios/interpolacion/escena-5.mp3', duracionAudioSeg: 20.86, duracionEscenaSeg: 23, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 125136 },
  'int-v6': { id: 'int-v6', ruta: 'audios/interpolacion/escena-6.mp3', duracionAudioSeg: 14.83, duracionEscenaSeg: 17, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 88992 },
  'int-v7': { id: 'int-v7', ruta: 'audios/interpolacion/escena-7.mp3', duracionAudioSeg: 20.09, duracionEscenaSeg: 22, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 120528 },
  'ig-v1': { id: 'ig-v1', ruta: 'audios/integracion/escena-1.mp3', duracionAudioSeg: 16.9, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 101376 },
  'ig-v2': { id: 'ig-v2', ruta: 'audios/integracion/escena-2.mp3', duracionAudioSeg: 13.68, duracionEscenaSeg: 16, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 82080 },
  'ig-v3': { id: 'ig-v3', ruta: 'audios/integracion/escena-3.mp3', duracionAudioSeg: 17.83, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 106992 },
  'ig-v4': { id: 'ig-v4', ruta: 'audios/integracion/escena-4.mp3', duracionAudioSeg: 16.99, duracionEscenaSeg: 19, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 101952 },
  'ig-v5': { id: 'ig-v5', ruta: 'audios/integracion/escena-5.mp3', duracionAudioSeg: 16.06, duracionEscenaSeg: 18, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 96336 },
  'ig-v6': { id: 'ig-v6', ruta: 'audios/integracion/escena-6.mp3', duracionAudioSeg: 13.56, duracionEscenaSeg: 16, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 81360 },
  'ig-v7': { id: 'ig-v7', ruta: 'audios/integracion/escena-7.mp3', duracionAudioSeg: 18.77, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 112608 },
  'ed-v1': { id: 'ed-v1', ruta: 'audios/diferenciales/escena-1.mp3', duracionAudioSeg: 17.64, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 105840 },
  'ed-v2': { id: 'ed-v2', ruta: 'audios/diferenciales/escena-2.mp3', duracionAudioSeg: 19.18, duracionEscenaSeg: 21, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 115056 },
  'ed-v3': { id: 'ed-v3', ruta: 'audios/diferenciales/escena-3.mp3', duracionAudioSeg: 18.34, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 110016 },
  'ed-v4': { id: 'ed-v4', ruta: 'audios/diferenciales/escena-4.mp3', duracionAudioSeg: 18.12, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 108720 },
  'ed-v5': { id: 'ed-v5', ruta: 'audios/diferenciales/escena-5.mp3', duracionAudioSeg: 14.52, duracionEscenaSeg: 17, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 87120 },
  'ed-v6': { id: 'ed-v6', ruta: 'audios/diferenciales/escena-6.mp3', duracionAudioSeg: 14.66, duracionEscenaSeg: 17, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 87984 },
  'ed-v7': { id: 'ed-v7', ruta: 'audios/diferenciales/escena-7.mp3', duracionAudioSeg: 17.98, duracionEscenaSeg: 20, proveedor: 'edge-tts', voz: 'es-PE-CamilaNeural', bytes: 107856 },
}

export function urlAudioEscena(rutaRelativa: string): string {
  const base = (import.meta.env?.BASE_URL || './').replace(/\/+$/, '')
  const limpia = rutaRelativa.replace(/^\/+/, '')
  return `${base}/${limpia}`
}

export function duracionModuloSeg(idsEscenas: readonly string[]): number {
  return idsEscenas.reduce((acc, id) => acc + (AUDIOS_MANIFEST[id]?.duracionEscenaSeg ?? 0), 0)
}
