import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const url = pathToFileURL(path.resolve('dist/index.html')).href + '#/m3'

test('sin errores de página y con enlace de retorno', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Interpolación y ajuste de curvas')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
  expect(errores).toEqual([])
})

test('Lagrange: P(1.5) = 1.9375, bases y gráfico', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('1.9375')
  const tabla = calc.getByRole('table', { name: /Contribución de cada base/ })
  await expect(tabla).toContainText('0.5625')
  await expect(tabla).toContainText('−0.0625')
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('Lagrange: abscisa repetida se rechaza sin resultado', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('no se elimina ningún nodo')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('Lagrange: consulta fuera del intervalo avisa', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
  await calc.getByLabel('Consulta x').fill('5')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('note').first()).toContainText('extrapolación')
})

test('regresión: y = 0.9 + 0.9x, SSE 0.7, predicción 2.25', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de regresión lineal' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.locator('dd', { hasText: /^y = 0\.9 \+ 0\.9·x$/ })).toBeVisible()
  await expect(calc.locator('dd', { hasText: /^0\.7$/ })).toBeVisible()
  await expect(calc.locator('dd', { hasText: /^2\.25$/ })).toBeVisible()
})

test('regresión: todas las x iguales no produce recta', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de regresión lineal' })
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('singular')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('comparación: 1.9375 vs 2.25 y captura', async ({ page }) => {
  await page.goto(url)
  const cmp = page.getByRole('region', { name: /Comparación: interpolar/ })
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  const tabla = cmp.getByRole('table', { name: /Comparación en la consulta/ })
  await expect(tabla).toContainText('1.9375')
  await expect(tabla).toContainText('2.25')
  await expect(cmp.locator('.main-svg').first()).toBeVisible()
  await cmp.screenshot({ path: 'test-results/m3-comparacion.png' })
})

test('ejemplo de oscilación: el polinomio toma valores negativos', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
  await calc.getByRole('button', { name: /oscilación/ }).click()
  await expect(calc.getByRole('status')).toContainText('P(0.8) = −0.048066')
  await expect(calc.getByRole('note').first()).toContainText('Runge')
})

test('ejercicios con solución oculta y autoevaluación', async ({ page }) => {
  await page.goto(url)
  await expect(page.getByText('10}{3}')).toHaveCount(0)
  await page.getByRole('button', { name: 'Ver solución del ejercicio 1' }).click()
  await expect(page.locator('#sol-m3-e1')).toBeVisible()
  await page.getByRole('button', { name: /Comprobar respuestas/ }).click()
  await expect(page.getByText(/Puntaje: 0 de 6/)).toBeVisible()
})
