# Plan del proyecto — Portal de Métodos Numéricos

Fuente: `docs/guia-laboratorio.pdf` (12 semanas, 5 módulos, 2 métodos por módulo).
Alcance actual: portal común + **Módulos 1, 2 y 3** (no lineales, sistemas lineales, interpolación y ajuste).
Módulos 4 y 5 quedan como tarjetas "pendiente" en el índice.

## Decisiones técnicas
| Tema | Decisión | Motivo (guía §3) |
|---|---|---|
| Stack | Vite + React + TypeScript | 5 módulos comparten componentes; el tipado fija el contrato de los motores |
| Ejecución sin servidor | `vite-plugin-singlefile` + `HashRouter`, `base: './'` | `dist/index.html` abre con doble clic (`file://`) y en GitHub Pages; verificado con Playwright |
| Gráficos | Plotly.js (`plotly.js-basic-dist-min`), empaquetado | Funciona offline, sin CDN |
| Fórmulas | KaTeX | Teoría con notación matemática |
| Separación | `src/core/<modulo>` (motor puro, sin React) vs componentes | La UI solo muestra la salida del motor |
| Entrada | Funciones predefinidas, nunca `eval` de texto libre | Alcance acotado |
| Referencia independiente | Python + numpy/scipy en `referencia/` (Octave no instalado) | No comparte código con el motor TS |
| Pruebas | Vitest (motores y componentes), Playwright (e2e), unittest (referencia) | ≥8 pruebas por módulo |
| Commits | Los hace el usuario al cerrar cada hito probado | Acordado |

## Contrato del motor
`metodo(entrada) -> { estado, mensaje, resultado, pasos[] }`
`estado ∈ {"convergio","max_iter","invalido","singular","no_finito","derivada_nula","sin_cambio_signo"}`

## Estructura
```
src/core/        motores numéricos puros (TS) + tipos del contrato
src/components/  Calculadora, TablaPasos, Grafico, Quiz, Ejercicio, Layout
src/modules/     m1-no-lineales/, m2-sistemas-lineales/ (contenido + página)
src/pages/       Inicio (portal)
e2e/             Playwright (incluye prueba file://)
referencia/      scripts Python + test_*.py
docs/            PLAN, matrices de prueba, fichas, informe
```

Comandos: `npm run dev | build | test | typecheck | test:e2e | test:ref`.

## Hitos
1. **Cimientos**: repo, portal, CSS, util, plot, enlace de retorno.
2. **M1 motor**: bisección y Newton, criterios de parada, detección de fallos, tests con valores de la guía.
3. **M1 web**: calculadoras, tablas, 2 gráficos, CSV, teoría, 2 ejemplos + caso comparativo.
4. **M1 didáctica**: 4 ejercicios, 6 preguntas, ficha común de errores, matriz de 8 pruebas.
5. **M2** repetir 2–4 (pivoteo parcial, Gauss-Seidel, residuo ∞, singularidad).
6. **Cierre**: referencia Python contrastada, README de ejecución, accesibilidad (teclado, móvil), tag `v0.1.0`.

## Valores de verificación (de la guía)
- M1: raíz 1.5213797068; 1.er punto medio 1.5, f=−0.125 → [1.5, 2]; Newton 1.5217391304; fallos: [2,3] sin cambio de signo, x³−1 con x0=0 derivada nula.
- M2: solución (1,2,3); GS iter 1 ≈ (2.25, 2.35, 2.7333333333); fallo: [[1,2],[2,4]]·x=(3,6) singular.

## Herramientas sugeridas
- Playwright para verificar en navegador real; ningún MCP adicional necesario.
