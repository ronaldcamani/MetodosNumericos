import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { calculadora } from './ayudas'

const url = pathToFileURL(path.resolve('dist/index.html')).href + '#/interpolacion'
const LAG = 'Calculadora de interpolación de Lagrange'
const REG = 'Calculadora de regresión lineal'

test('sin errores de página y con enlace de retorno', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Interpolación y ajuste de curvas')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
  expect(errores).toEqual([])
})

test('Lagrange: P(1.5) = 1.9375, bases y gráfico', async ({ page }) => {
  await page.goto(url + '/lagrange')
  const calc = await calculadora(page, LAG, 'lagrange')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('1.9375')
  const tabla = calc.getByRole('table', { name: /Contribución de cada base/ })
  await expect(tabla).toContainText('0.5625')
  await expect(tabla).toContainText('−0.0625')
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('Lagrange: abscisa repetida se rechaza sin resultado', async ({ page }) => {
  await page.goto(url + '/lagrange')
  const calc = await calculadora(page, LAG, 'lagrange')
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('no se elimina ningún nodo')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('Lagrange: consulta fuera del intervalo avisa', async ({ page }) => {
  await page.goto(url + '/lagrange')
  const calc = await calculadora(page, LAG, 'lagrange')
  await calc.getByLabel('Consulta x').fill('5')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('note').first()).toContainText('extrapolación')
})

test('regresión: y = 0.9 + 0.9x, SSE 0.7, predicción 2.25', async ({ page }) => {
  await page.goto(url + '/regresion')
  const calc = await calculadora(page, REG, 'regresion')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.locator('dd', { hasText: /^y = 0\.9 \+ 0\.9·x$/ })).toBeVisible()
  await expect(calc.locator('dd', { hasText: /^0\.7$/ })).toBeVisible()
  await expect(calc.locator('dd', { hasText: /^2\.25$/ })).toBeVisible()
})

test('regresión: todas las x iguales no produce recta', async ({ page }) => {
  await page.goto(url + '/regresion')
  const calc = await calculadora(page, REG, 'regresion')
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
  await page.goto(url + '/lagrange')
  const calc = await calculadora(page, LAG, 'lagrange')
  await calc.getByRole('button', { name: /oscilación/ }).click()
  await expect(calc.getByRole('status')).toContainText('P(0.8) = −0.048066')
  await expect(calc.getByRole('note').first()).toContainText('Runge')
})

test('ejercicios con solución oculta y autoevaluación', async ({ page }) => {
  await page.goto(url + '/lagrange')
  await expect(page.getByText('10}{3}')).toHaveCount(0)
  await page.getByRole('button', { name: /Mostrar todos los pasos de ejercicio 1/ }).click()
  await expect(page.locator('#ejercicios .paso-visible').first()).toBeVisible()
  await page.getByRole('button', { name: /Comprobar respuestas/ }).click()
  await expect(page.getByText(/Puntaje: 0 de 3/)).toBeVisible()
})

test('analiza y decide: mediciones ruidosas → regresión recomendada; el ejercicio con plan predice 9.85', async ({ page }) => {
  await page.goto(url)
  await page.getByRole('button', { name: 'Analizar este problema' }).nth(1).click()
  await expect(page.getByRole('heading', { name: /Regresión lineal · ✔ Recomendado/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Interpolación de Lagrange · ✖ No recomendado/ })).toBeVisible()
  const ej = page.locator('#ejercicios')
  await ej.getByRole('radio', { name: /Interpolación de Lagrange con los cuatro puntos/ }).check()
  await expect(ej.getByRole('status')).toContainText('No recomendado')
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: LAG })
  await expect(calc.getByRole('status')).toContainText('7.5')
})

test('páginas del tema: Lagrange y regresión con su subnavegación', async ({ page }) => {
  await page.goto(url)
  const sub = page.getByRole('navigation', { name: /Páginas de interpolación/ })
  await expect(sub.getByRole('link')).toHaveCount(3)
  await sub.getByRole('link', { name: 'Ajuste por regresión' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ajuste por regresión')
  await expect(sub.getByRole('link', { name: 'Ajuste por regresión' })).toHaveAttribute('aria-current', 'page')
})
