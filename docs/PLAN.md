# Plan del proyecto — Portal de Métodos Numéricos

Fuente: `docs/guia-laboratorio.pdf` (12 semanas, 5 módulos, 2 métodos por módulo).
Alcance actual: portal común + **Módulo 1** (no lineales) + **Módulo 2** (sistemas lineales).
Módulos 3, 4 y 5 quedan como tarjetas "pendiente" en el índice.

## Decisiones técnicas
| Tema | Decisión | Motivo (guía §3) |
|---|---|---|
| Stack | HTML + CSS + JS clásico, sin build, sin servidor | Sin servidor/BD; abre con doble clic (`file://`) |
| Módulos JS | Patrón UMD (`window.X` en navegador, `module.exports` en Node) | `type="module"` falla en `file://` |
| Gráficos | SVG propio (`assets/js/plot.js`) | Cero dependencias, funciona offline |
| Separación | `motor` (datos → resultado, pasos, estado, mensaje) vs `ui` | La guía exige que la UI solo muestre la salida |
| Entrada | Funciones predefinidas, nunca `eval` de texto libre | Evita ampliar alcance y riesgos |
| Referencia independiente | Python stdlib (`fractions`, `decimal`) en `referencia/` | Octave/numpy no instalados; no comparte código con JS |
| Pruebas | `node --test` (motor JS) + `unittest` (referencia) | Sin dependencias npm |
| Publicación | Git local ahora; GitHub Pages después (rutas relativas) | Remoto aún no definido |

## Contrato del motor
`metodo(entrada) -> { estado, mensaje, resultado, pasos[] }`
`estado ∈ {"convergio","max_iter","invalido","singular","no_finito","derivada_nula","sin_cambio_signo"}`

## Estructura
```
index.html                 portal (índice de módulos)
assets/css|js/             estilos, util (formato, CSV), plot (SVG), nav
modulos/m1-no-lineales/    index.html, motor.js, ui.js, datos.js
modulos/m2-sistemas-lineales/
referencia/                m1.py, m2.py + test_*.py
tests/                     *.test.js (≥8 pruebas por módulo)
docs/                      PLAN, matrices de prueba, fichas, informe
```

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
- Skill `webapp-testing`/Chrome MCP: verificar las páginas en navegador real (ya disponible).
- Skills de diseño (`frontend-design`) opcionales para pulir la UI.
- No hace falta ningún MCP adicional.
