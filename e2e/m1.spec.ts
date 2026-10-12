import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const url = pathToFileURL(path.resolve('dist/index.html')).href + '#/m1'

test.beforeEach(async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(url)
  test.info().annotations.push({ type: 'errores', description: '' })
  ;(page as unknown as { __errores: string[] }).__errores = errores
})

test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errores: string[] }).__errores).toEqual([])
})

test('bisección: caso base, tabla y gráfico', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de bisección' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('20 iteraciones')
  await expect(calc.getByText(/1\.52138/).first()).toBeVisible()
  await expect(calc.getByRole('table')).toBeVisible()
  await expect(calc.locator('.main-svg').first()).toBeVisible()
  await calc.screenshot({ path: 'test-results/m1-biseccion.png' })
})

test('bisección: prueba de fallo [2, 3] explica la causa', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de bisección' })
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('mismo signo')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('Newton: caso base y fallo por derivada nula', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de Newton' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('convergio')
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('derivada_nula')
})

test('editar un dato descarta el resultado anterior', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de bisección' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('table')).toBeVisible()
  await calc.getByLabel('Tolerancia').fill('0.001')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('entrada inválida muestra error en el campo', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de bisección' })
  await calc.getByLabel('Extremo a').fill('abc')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByText('Ingresa un número.')).toBeVisible()
})

test('comparación: si un método falla se conserva la salida del otro', async ({ page }) => {
  const cmp = page.getByRole('region', { name: /Comparación bisección vs Newton/ })
  await cmp.getByLabel('Extremo a').fill('2')
  await cmp.getByLabel('Extremo b').fill('3')
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  await expect(cmp.getByRole('alert')).toContainText('sin_cambio_signo')
  await expect(cmp.getByRole('status')).toContainText('convergio')
  await cmp.screenshot({ path: 'test-results/m1-comparacion.png' })
})

test('exportar CSV descarga los datos de la tabla', async ({ page }) => {
  const calc = page.getByRole('region', { name: 'Calculadora de Newton' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const [d] = await Promise.all([page.waitForEvent('download'), calc.getByRole('button', { name: 'Exportar CSV' }).click()])
  expect(d.suggestedFilename()).toBe('newton.csv')
  const texto = (await import('node:fs')).readFileSync(await d.path()!, 'utf8')
  expect(texto).toContain('1.5217391304')
})

test('el móvil no genera scroll horizontal de página', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.getByRole('region', { name: 'Calculadora de bisección' }).getByRole('button', { name: 'Calcular' }).click()
  const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  expect(ancho[0]).toBeLessThanOrEqual(ancho[1])
})
