# Composiciones Cinematográficas 60 FPS y Prompts de Video

Esta carpeta reúne los entregables exportables de video generados con **HyperFrames (HTML + GSAP 60 FPS a 1920×1080)** y los guiones **Higgsfield AI + Vibe Motion**, alineados cuadro a cuadro con el reproductor interactivo de la aplicación (`src/components/VideoLeccion.tsx`, `src/components/VideoEscenarios.tsx` y `src/core/lecciones.ts`).

El script histórico en Manim + Edge-TTS se conserva intacto en [`referencia/videos_manim.py`](../referencia/videos_manim.py).

## Estructura

- `videos/errores/index.html` — Composición `36s` (`errores`)
- `videos/ecuaciones/index.html` — Composición `35s` (`ecuaciones`)
- `videos/sistemas/index.html` — Composición `35s` (`sistemas`)
- `videos/interpolacion/index.html` — Composición `35s` (`interpolacion`)
- `videos/integracion/index.html` — Composición `34s` (`integracion`)
- `videos/diferenciales/index.html` — Composición `35s` (`diferenciales`)
- `videos/higgsfield-prompts.md` — 6 prompts MCSLA de video B-roll + 6 briefs Vibe Motion

## Validación y renderizado con HyperFrames CLI

Validar cualquier composición sin salir del proyecto:

```bash
node .agents/skills/hyperframes/scripts/plugin-cli.mjs lint videos/ecuaciones
```

Previsualizar o exportar a MP4 1080p a 60 FPS:

```bash
node .agents/skills/hyperframes/scripts/plugin-cli.mjs preview videos/ecuaciones
node .agents/skills/hyperframes/scripts/plugin-cli.mjs render videos/ecuaciones -o dist/ecuaciones-60fps.mp4
```
