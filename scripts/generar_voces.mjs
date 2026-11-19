import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LECCIONES_VIDEO } from '../src/core/lecciones.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(__dirname, '..')
const DIR_AUDIOS = join(RAIZ, 'public', 'audios')
const RUTA_MANIFEST_JSON = join(DIR_AUDIOS, 'manifest.json')
const RUTA_MANIFEST_TS = join(RAIZ, 'src', 'core', 'audiosManifest.ts')
const RUTA_LECCIONES_TS = join(RAIZ, 'src', 'core', 'lecciones.ts')

const EDGE_VOICES = ['es-PE-CamilaNeural', 'es-PE-AlexNeural', 'es-MX-DaliaNeural']
const EDGE_RATE = '-3%'
const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2'
const OUTPUT_FORMAT = 'mp3_44100_64'
const MIN_BYTES = 5120

function parseArgs(argv) {
  let force = false
  let provider = 'edge-tts'
  let voiceId = ''
  for (const arg of argv) {
    if (arg === '--force') {
      force = true
    } else if (arg.startsWith('--provider=')) {
      provider = arg.slice('--provider='.length).trim().toLowerCase()
    } else if (arg.startsWith('--voice=')) {
      voiceId = arg.slice('--voice='.length).trim()
    }
  }
  if (provider !== 'edge-tts' && provider !== 'elevenlabs') {
    throw new Error(`Proveedor inválido "${provider}". Usa --provider=edge-tts o --provider=elevenlabs.`)
  }
  return { force, provider, voiceId }
}

function leerApiKey() {
  if (process.env.ELEVENLABS_API_KEY?.trim()) {
    return process.env.ELEVENLABS_API_KEY.trim()
  }
  const envPath = join(RAIZ, '.env.local')
  if (!existsSync(envPath)) return ''
  const contenido = readFileSync(envPath, 'utf8')
  const match = contenido.match(/^ELEVENLABS_API_KEY=(.+)$/m)
  if (!match) return ''
  return match[1].trim().replace(/^["']|["']$/g, '')
}

function sha256(texto) {
  return createHash('sha256').update(texto.trim(), 'utf8').digest('hex')
}

function leerManifestPrevio() {
  if (!existsSync(RUTA_MANIFEST_JSON)) return {}
  try {
    const crudo = JSON.parse(readFileSync(RUTA_MANIFEST_JSON, 'utf8'))
    return crudo?.escenas && typeof crudo.escenas === 'object' ? crudo.escenas : {}
  } catch {
    return {}
  }
}

async function consultarCuotaElevenLabs(apiKey) {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey },
    })
    if (!res.ok) {
      return { ok: false, status: res.status, remaining: 0 }
    }
    const data = await res.json()
    const limit = Number(data?.character_limit ?? 0)
    const count = Number(data?.character_count ?? 0)
    return {
      ok: true,
      status: res.status,
      tier: String(data?.tier ?? 'unknown'),
      used: count,
      limit,
      remaining: Math.max(0, limit - count),
    }
  } catch {
    return { ok: false, status: 0, remaining: 0 }
  }
}

async function seleccionarVozEspanolElevenLabs(apiKey, preferredVoiceId) {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  })
  if (!res.ok) {
    return { ok: false, motivo: `HTTP ${res.status} al consultar /v1/voices` }
  }
  const data = await res.json()
  const voces = Array.isArray(data?.voices) ? data.voices : []
  const esNativaEspanol = (v) => String(v?.labels?.language ?? '').trim().toLowerCase() === 'es'

  if (preferredVoiceId) {
    const exacta = voces.find((v) => v?.voice_id === preferredVoiceId)
    if (!exacta) {
      return { ok: false, motivo: `La voz "${preferredVoiceId}" no existe en la cuenta de ElevenLabs` }
    }
    if (!esNativaEspanol(exacta)) {
      const lang = exacta?.labels?.language ?? 'desconocido'
      return {
        ok: false,
        motivo: `La voz "${exacta.name}" (${preferredVoiceId}) tiene labels.language="${lang}", no es español nativo ("es")`,
      }
    }
    return { ok: true, voiceId: exacta.voice_id, voiceName: `${exacta.name} (ElevenLabs · es)` }
  }

  const candidata = voces.find(esNativaEspanol)
  if (!candidata) {
    return { ok: false, motivo: 'No hay voces con labels.language === "es" disponibles en ElevenLabs' }
  }
  return { ok: true, voiceId: candidata.voice_id, voiceName: `${candidata.name} (ElevenLabs · es)` }
}

async function generarConElevenLabs({ apiKey, voiceId, text, previousText, nextText, outPath }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`
  const body = {
    text,
    model_id: ELEVENLABS_MODEL_ID,
    language_code: 'es',
    voice_settings: {
      stability: 0.58,
      similarity_boost: 0.78,
      style: 0.05,
      use_speaker_boost: true,
      speed: 0.94,
    },
    ...(previousText ? { previous_text: previousText } : {}),
    ...(nextText ? { next_text: nextText } : {}),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '')
    const esCuota =
      res.status === 401 ||
      res.status === 402 ||
      res.status === 429 ||
      /quota_exceeded|insufficient_credits|character_limit|limit_exceeded|paid_plan_required/i.test(
        errTxt,
      )
    return { ok: false, esCuota, status: res.status, detalle: errTxt.slice(0, 240) }
  }

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.byteLength <= MIN_BYTES) {
    return {
      ok: false,
      esCuota: false,
      status: res.status,
      detalle: `Archivo MP3 demasiado pequeño (${buf.byteLength} B)`,
    }
  }

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, buf)
  const charsHeader = Number(res.headers.get('x-character-count') || text.length)
  return {
    ok: true,
    bytes: buf.byteLength,
    creditsEstimados: charsHeader,
  }
}

function generarConEdgeTTS(text, outPath) {
  mkdirSync(dirname(outPath), { recursive: true })
  const pyScript = `
import asyncio, json, sys, edge_tts
payload = json.loads(sys.stdin.read())
async def run():
    last_err = None
    for voice in payload["voices"]:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(payload["text"], voice, rate=payload["rate"])
                await comm.save(payload["outPath"])
                return voice
            except Exception as exc:
                last_err = exc
                await asyncio.sleep(0.6 * (attempt + 1))
    raise last_err
print(asyncio.run(run()))
`.trim()

  const usedVoice = execFileSync('python', ['-c', pyScript], {
    input: JSON.stringify({ text, outPath, voices: EDGE_VOICES, rate: EDGE_RATE }),
    encoding: 'utf8',
    timeout: 60000,
  }).trim()

  const size = existsSync(outPath) ? statSync(outPath).size : 0
  if (size <= MIN_BYTES) {
    throw new Error(`Edge-TTS generó un archivo inválido (${size} B) en ${outPath}`)
  }
  return { voice: usedVoice || EDGE_VOICES[0], bytes: size }
}

function medirDuracionesMp3(rutasAbsolutas) {
  const pyScript = `
import json, sys
from mutagen.mp3 import MP3
paths = json.loads(sys.stdin.read())
out = {}
for p in paths:
    audio = MP3(p)
    out[p] = round(float(audio.info.length), 3)
print(json.dumps(out))
`.trim()
  const raw = execFileSync('python', ['-c', pyScript], {
    input: JSON.stringify(rutasAbsolutas),
    encoding: 'utf8',
    timeout: 30000,
  })
  return JSON.parse(raw)
}

function actualizarDuracionesLecciones(escenasMeta) {
  let codigo = readFileSync(RUTA_LECCIONES_TS, 'utf8')
  let actualizadas = 0
  for (const [id, meta] of Object.entries(escenasMeta)) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(id:\\s*'${escapedId}'[\\s\\S]*?duracion:\\s*)(\\d+)`)
    if (!regex.test(codigo)) {
      throw new Error(`No se encontró duracion para la escena ${id} en src/core/lecciones.ts`)
    }
    codigo = codigo.replace(regex, `$1${meta.duracionEscenaSeg}`)
    actualizadas++
  }
  writeFileSync(RUTA_LECCIONES_TS, codigo, 'utf8')
  return actualizadas
}

function fmtMMSS(seg) {
  const total = Math.round(seg)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function main() {
  const { force, provider, voiceId: requestedVoiceId } = parseArgs(process.argv.slice(2))
  mkdirSync(DIR_AUDIOS, { recursive: true })

  const previo = leerManifestPrevio()
  const registro = {}
  const tareas = []

  for (const [modulo, leccion] of Object.entries(LECCIONES_VIDEO)) {
    leccion.escenas.forEach((esc, idx) => {
      const rutaRel = `audios/${modulo}/escena-${idx + 1}.mp3`
      const rutaAbs = join(RAIZ, 'public', rutaRel)
      const hash = sha256(`${provider}|${EDGE_RATE}|${esc.narracion}`)
      const prev = previo[esc.id]
      const vozPrevEsNativa =
        provider === 'edge-tts'
          ? prev?.proveedor === 'edge-tts' && EDGE_VOICES.includes(prev?.voz)
          : prev?.proveedor === 'elevenlabs' && String(prev?.voz || '').includes('(ElevenLabs · es)')
      const cacheValido =
        !force &&
        existsSync(rutaAbs) &&
        statSync(rutaAbs).size > MIN_BYTES &&
        prev?.hash === hash &&
        vozPrevEsNativa

      tareas.push({
        modulo,
        idx,
        esc,
        rutaRel,
        rutaAbs,
        hash,
        prev,
        cacheValido,
        prevText: idx > 0 ? leccion.escenas[idx - 1].narracion.trim() : undefined,
        nextText:
          idx + 1 < leccion.escenas.length
            ? leccion.escenas[idx + 1].narracion.trim()
            : undefined,
      })
    })
  }

  const pendientes = tareas.filter((t) => !t.cacheValido)
  let usarElevenLabs = provider === 'elevenlabs' && pendientes.length > 0
  let apiKey = ''
  let elVoiceId = ''
  let elVoiceName = ''
  let remainingCredits = null

  if (usarElevenLabs) {
    apiKey = leerApiKey()
    if (!apiKey) {
      console.warn('⚠️ Sin ELEVENLABS_API_KEY; usando Edge-TTS en español nativo.')
      usarElevenLabs = false
    } else {
      const seleccion = await seleccionarVozEspanolElevenLabs(apiKey, requestedVoiceId)
      if (!seleccion.ok) {
        console.warn(`⚠️ ElevenLabs rechazado (${seleccion.motivo}); usando Edge-TTS (${EDGE_VOICES[0]}).`)
        usarElevenLabs = false
      } else {
        elVoiceId = seleccion.voiceId
        elVoiceName = seleccion.voiceName
        const cuota = await consultarCuotaElevenLabs(apiKey)
        if (cuota.ok) {
          remainingCredits = cuota.remaining
          console.log(
            `ElevenLabs conectado (${elVoiceName}, plan ${cuota.tier}): ${cuota.remaining} créditos disponibles.`,
          )
          if (remainingCredits <= 0) {
            console.warn(`⚠️ 0 créditos en ElevenLabs; usando Edge-TTS (${EDGE_VOICES[0]}).`)
            usarElevenLabs = false
          }
        }
      }
    }
  }

  if (pendientes.length === 0) {
    console.log('Todas las escenas en español nativo están vigentes en caché SHA-256.')
  } else {
    console.log(
      `Generando ${pendientes.length} audio(s) con ${usarElevenLabs ? `ElevenLabs (${elVoiceName}, ${ELEVENLABS_MODEL_ID})` : `Edge-TTS (${EDGE_VOICES[0]}, rate ${EDGE_RATE})`}${force ? ' [--force]' : ''}...`,
    )
  }

  const stats = { cache: 0, elevenlabs: 0, edge: 0 }

  for (const t of tareas) {
    if (t.cacheValido) {
      stats.cache++
      registro[t.esc.id] = {
        id: t.esc.id,
        modulo: t.modulo,
        escena: t.idx + 1,
        ruta: t.rutaRel,
        hash: t.hash,
        proveedor: t.prev.proveedor,
        voz: t.prev.voz,
        bytes: statSync(t.rutaAbs).size,
      }
      continue
    }

    const texto = t.esc.narracion.trim()
    let generado = false

    if (usarElevenLabs) {
      if (remainingCredits !== null && remainingCredits < texto.length) {
        console.warn(`\n⚠️ Créditos de ElevenLabs insuficientes (${remainingCredits} < ${texto.length}); cambiando a Edge-TTS.`)
        usarElevenLabs = false
      } else {
        process.stdout.write(`🎙️  [ElevenLabs] ${t.modulo}/escena-${t.idx + 1}.mp3 (${texto.length} chars)... `)
        const resEL = await generarConElevenLabs({
          apiKey,
          voiceId: elVoiceId,
          text: texto,
          previousText: t.prevText,
          nextText: t.nextText,
          outPath: t.rutaAbs,
        })
        if (resEL.ok) {
          if (remainingCredits !== null) {
            remainingCredits = Math.max(0, remainingCredits - resEL.creditsEstimados)
          }
          console.log(`OK (${(resEL.bytes / 1024).toFixed(1)} KB)`)
          stats.elevenlabs++
          registro[t.esc.id] = {
            id: t.esc.id,
            modulo: t.modulo,
            escena: t.idx + 1,
            ruta: t.rutaRel,
            hash: t.hash,
            proveedor: 'elevenlabs',
            voz: `${elVoiceName} · ${ELEVENLABS_MODEL_ID}`,
            bytes: resEL.bytes,
          }
          generado = true
        } else {
          console.log(`FALLO HTTP ${resEL.status}`)
          if (resEL.esCuota) usarElevenLabs = false
        }
      }
    }

    if (!generado) {
      process.stdout.write(`🔊 [Edge-TTS]   ${t.modulo}/escena-${t.idx + 1}.mp3... `)
      const resEdge = generarConEdgeTTS(texto, t.rutaAbs)
      console.log(`OK (${(resEdge.bytes / 1024).toFixed(1)} KB, ${resEdge.voice})`)
      stats.edge++
      registro[t.esc.id] = {
        id: t.esc.id,
        modulo: t.modulo,
        escena: t.idx + 1,
        ruta: t.rutaRel,
        hash: t.hash,
        proveedor: 'edge-tts',
        voz: resEdge.voice,
        bytes: resEdge.bytes,
      }
    }
  }

  const duracionesMap = medirDuracionesMp3(tareas.map((t) => t.rutaAbs))
  for (const t of tareas) {
    const audioSeg = Number((duracionesMap[t.rutaAbs] ?? 20).toFixed(2))
    const escenaSeg = Math.ceil(audioSeg + 1.5)
    registro[t.esc.id].duracionAudioSeg = audioSeg
    registro[t.esc.id].duracionEscenaSeg = escenaSeg
  }

  const modulosResumen = {}
  for (const [modulo, leccion] of Object.entries(LECCIONES_VIDEO)) {
    const items = leccion.escenas.map((e) => registro[e.id])
    const audioTotal = items.reduce((s, x) => s + x.duracionAudioSeg, 0)
    const escenaTotal = items.reduce((s, x) => s + x.duracionEscenaSeg, 0)
    modulosResumen[modulo] = {
      escenas: items.length,
      duracionAudioTotalSeg: Number(audioTotal.toFixed(2)),
      duracionLeccionTotalSeg: escenaTotal,
      formato: fmtMMSS(escenaTotal),
    }
  }

  const manifestObj = {
    generadoEn: new Date().toISOString(),
    modulos: modulosResumen,
    escenas: registro,
  }
  writeFileSync(RUTA_MANIFEST_JSON, `${JSON.stringify(manifestObj, null, 2)}\n`, 'utf8')

  const tsLines = [
    '// Archivo generado por scripts/generar_voces.mjs — no editar manualmente las duraciones.',
    '',
    "export type ProveedorVoz = 'elevenlabs' | 'edge-tts' | 'cache'",
    '',
    'export interface AudioEscenaMeta {',
    '  readonly id: string',
    '  readonly ruta: string',
    '  readonly duracionAudioSeg: number',
    '  readonly duracionEscenaSeg: number',
    '  readonly proveedor: ProveedorVoz',
    '  readonly voz: string',
    '  readonly bytes: number',
    '}',
    '',
    'export const AUDIOS_MANIFEST: Record<string, AudioEscenaMeta> = {',
  ]
  for (const t of tareas) {
    const m = registro[t.esc.id]
    tsLines.push(
      `  '${m.id}': { id: '${m.id}', ruta: '${m.ruta}', duracionAudioSeg: ${m.duracionAudioSeg}, duracionEscenaSeg: ${m.duracionEscenaSeg}, proveedor: '${m.proveedor}', voz: '${m.voz.replace(/'/g, "\\'")}', bytes: ${m.bytes} },`,
    )
  }
  tsLines.push(
    '}',
    '',
    'export function urlAudioEscena(rutaRelativa: string): string {',
    "  const base = (import.meta.env?.BASE_URL || './').replace(/\\/+$/, '')",
    "  const limpia = rutaRelativa.replace(/^\\/+/, '')",
    '  return `${base}/${limpia}`',
    '}',
    '',
    'export function duracionModuloSeg(idsEscenas: readonly string[]): number {',
    '  return idsEscenas.reduce((acc, id) => acc + (AUDIOS_MANIFEST[id]?.duracionEscenaSeg ?? 0), 0)',
    '}',
    '',
  )
  writeFileSync(RUTA_MANIFEST_TS, tsLines.join('\n'), 'utf8')

  const nActualizadas = actualizarDuracionesLecciones(registro)

  console.log('\n=== RESUMEN DE AUDIOS GENERADOS ===')
  console.log(
    `Caché: ${stats.cache} | ElevenLabs: ${stats.elevenlabs} | Edge-TTS: ${stats.edge} | Escenas actualizadas en lecciones.ts: ${nActualizadas}`,
  )
  for (const [mod, r] of Object.entries(modulosResumen)) {
    const rangoOk = r.duracionLeccionTotalSeg >= 120 && r.duracionLeccionTotalSeg <= 210
    console.log(
      ` - ${mod.padEnd(14)} ${r.escenas} escenas | audio ${r.duracionAudioTotalSeg.toFixed(1)}s | total ${r.duracionLeccionTotalSeg}s (${r.formato}) ${rangoOk ? '✔' : '⚠ FUERA DE [120,210]'}`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
