# Portal de Métodos Numéricos (UNSA, Ingeniería de Sistemas)

Portal educativo con cinco temas más uno de fundamentos (errores), pensado para que otros estudiantes aprendan a **plantear un problema, decidir el método y comprobar el resultado**. Cada tema tiene: planteo y decisión, una página por familia de métodos, calculadora lateral con selector, ejercicios con plan de solución, pista y solución, y autoevaluación con explicación adicional.

| Tema | Métodos |
|---|---|
| Errores y aritmética de computador | Error absoluto/relativo, redondeo y truncamiento, cancelación |
| Ecuaciones no lineales | Bisección, falsa posición, Newton, secante, raíces de polinomios |
| Sistemas de ecuaciones lineales | Eliminación con pivoteo parcial, Gauss-Seidel |
| Interpolación y ajuste de curvas | Lagrange, regresión lineal |
| Integración y derivación numérica | Trapecio, Simpson, diferencias finitas |
| Ecuaciones diferenciales | Euler explícito, Runge-Kutta 4, estabilidad |

Los datos y modelos son **sintéticos**; no representan sistemas reales.

## Ejecutar (sin servidor, sin conexión)

```
npm install        # una vez (necesita conexión)
npm run build      # genera dist/index.html: se abre con doble clic
npm run dev        # desarrollo
```

## Pruebas

```
npm test           # motores y componentes (Vitest)
npm run test:e2e   # navegador real (Playwright; requiere npm run build)
npm run test:ref   # código de referencia independiente (Python: numpy/scipy)
```

El código de referencia está en `referencia/` (un script por tema, escrito aparte del motor). La matriz de pruebas está en `docs/matriz-pruebas.md` y el plan en `docs/PLAN.md`. Fuentes e instrucciones también en la página **Recursos** del portal.

## Estructura

```
src/core/<tema>/     motores numéricos puros (sin React) y sus pruebas
src/modules/<tema>/  páginas, calculadoras, ejercicios y preguntas
src/components/      calculadora, panel lateral, decisor, ejercicios, autoevaluación…
referencia/          scripts Python de referencia y sus pruebas
e2e/                 pruebas de navegador
```
