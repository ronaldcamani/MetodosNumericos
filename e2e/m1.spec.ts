import { test, expect, type Page } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const base = pathToFileURL(path.resolve('dist/index.html')).href

test.beforeEach(async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  ;(page as unknown as { __errores: string[] }).__errores = errores
})

test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errores: string[] }).__errores).toEqual([])
})

/** Abre el panel (a 1280 px es un cajón) y devuelve la calculadora de raíces. */
async function abrirCalculadora(page: Page) {
  await page.getByRole('button', { name: 'Abrir calculadora', expanded: false }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await expect(calc).toBeVisible()
  return calc
}

test('hub: título, subnavegación y enlace de retorno', async ({ page }) => {
  await page.goto(base + '#/ecuaciones')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ecuaciones no lineales')
  const sub = page.getByRole('navigation', { name: 'Páginas de ecuaciones no lineales' })
  await expect(sub.getByRole('link')).toHaveCount(4)
  await expect(sub.getByRole('link', { name: 'Planteo y decisión' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
})

test('la subnavegación lleva a cerrados, abiertos y polinomios', async ({ page }) => {
  await page.goto(base + '#/ecuaciones')
  for (const [enlace, titulo] of [['Métodos cerrados', 'Métodos cerrados'], ['Métodos abiertos', 'Métodos abiertos'], ['Raíces de polinomios', 'Raíces de polinomios']] as const) {
    await page.getByRole('navigation', { name: 'Páginas de ecuaciones no lineales' }).getByRole('link', { name: enlace }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(titulo)
    await expect(page.getByRole('navigation', { name: 'Páginas de ecuaciones no lineales' }).getByRole('link', { name: enlace })).toHaveAttribute('aria-current', 'page')
  }
})

test('bisección: caso base, tabla, gráfico y captura', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('20 iteraciones')
  await expect(calc.getByText(/1\.52138/).first()).toBeVisible()
  await expect(calc.getByRole('table', { name: /bisección/i })).toBeVisible()
  await expect(calc.locator('.main-svg').first()).toBeVisible()
  await page.screenshot({ path: 'test-results/m1-biseccion.png' })
})

test('falsa posición: elegir el método en el selector y ver su tabla', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByLabel('Método').selectOption('falsa')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const tabla = calc.getByRole('table', { name: /falsa posición/i })
  await expect(tabla).toBeVisible()
  await expect(tabla.getByRole('row').nth(1)).toContainText('1.3333333333')
  await expect(calc.getByRole('status')).toContainText('convergio')
})

test('bisección: prueba de fallo [2, 3] explica la causa', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('mismo signo')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('el polo no se declara raíz: «no converge»', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  await page.getByRole('button', { name: 'Probar el polo' }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await expect(calc.getByRole('alert')).toContainText('no_converge')
})

test('Newton y secante: caso base y fallos controlados', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/abiertos')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('convergio')
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('derivada_nula')
  await calc.getByLabel('Método').selectOption('secante')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('convergio')
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('derivada_nula')
})

test('Newton cicla en x³ − 2x + 2 desde 0: sin convergencia, no éxito', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/abiertos')
  await page.locator('#fallos').getByRole('button', { name: 'Probar' }).nth(1).click()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await expect(calc.getByRole('alert')).toContainText('max_iter')
  await expect(calc.getByRole('alert')).toContainText('Sin convergencia')
})

test('polinomios: todas las raíces de x³ − x − 2 con par complejo y deflación', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/polinomios')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('1 real(es) y 2 complejas')
  const raices = calc.getByRole('table', { name: 'Raíces del polinomio' })
  await expect(raices.getByRole('row')).toHaveCount(4)
  await expect(raices).toContainText('0.8578736')
  await expect(calc.getByRole('table', { name: /Deflación/ })).toBeVisible()
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('polinomio con coeficiente principal 0 se rechaza', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/polinomios')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByText(/no puede ser 0/)).toBeVisible()
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('editar un dato descarta el resultado anterior', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('table')).toBeVisible()
  await calc.getByLabel('Tolerancia').fill('0.001')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('entrada inválida muestra error en el campo', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByLabel('Extremo a').fill('abc')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByText('Ingresa un número.')).toBeVisible()
})

test('comparación de los cuatro métodos: si uno falla se conservan los demás', async ({ page }) => {
  await page.goto(base + '#/ecuaciones')
  const cmp = page.getByRole('region', { name: /Comparación de los cuatro métodos/ })
  await cmp.getByLabel('Extremo a (también 1.er punto de la secante)').fill('2')
  await cmp.getByLabel('Extremo b (también 2.º punto de la secante)').fill('3')
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  await expect(cmp.getByRole('alert')).toHaveCount(2) // bisección y falsa posición sin cambio de signo
  await expect(cmp.getByRole('status')).toHaveCount(2) // Newton y secante convergen
  await expect(cmp.getByRole('table', { name: 'Resumen comparativo' })).toContainText('sin_cambio_signo')
  await cmp.screenshot({ path: 'test-results/m1-comparacion.png' })
})

test('exportar CSV descarga los datos de la tabla', async ({ page }) => {
  await page.goto(base + '#/ecuaciones/abiertos')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const [d] = await Promise.all([page.waitForEvent('download'), calc.getByRole('button', { name: 'Exportar CSV' }).click()])
  expect(d.suggestedFilename()).toBe('newton.csv')
  const texto = (await import('node:fs')).readFileSync(await d.path()!, 'utf8')
  expect(texto).toContain('1.5217391304')
})

test('el móvil no genera scroll horizontal con el panel abierto', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(base + '#/ecuaciones/cerrados')
  const calc = await abrirCalculadora(page)
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  expect(ancho[0]).toBeLessThanOrEqual(ancho[1])
})

test('analiza y decide: un problema lleva a una recomendación y la calculadora lo prueba', async ({ page }) => {
  await page.goto(base + '#/ecuaciones')
  await page.getByRole('button', { name: 'Analizar este problema' }).nth(1).click()
  await expect(page.getByText(/Cómo lo analizamos: Una simulación costosa/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Newton · ✖ No recomendado/ })).toBeVisible()
  await page.getByRole('button', { name: /Probar Falsa posición en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await expect(calc).toBeVisible()
  await expect(calc.getByRole('table', { name: /falsa posición/i })).toBeVisible()
})

test('ejercicio con plan: elegir un método da retroalimentación y abre la calculadora', async ({ page }) => {
  await page.goto(base + '#/ecuaciones')
  const ej = page.locator('#ejercicios')
  await ej.getByRole('radio', { name: /Newton desde x₀ = 0/ }).check()
  await expect(ej.getByRole('status')).toContainText('No recomendado')
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await expect(calc.getByRole('alert')).toContainText('derivada_nula')
  // la pista y la solución siguen ocultas hasta pedirlas
  await expect(ej.locator('#sol-dec-e3')).toHaveCount(0)
})
