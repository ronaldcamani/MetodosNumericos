import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const url = pathToFileURL(path.resolve('dist/index.html')).href + '#/m4'

test('sin errores de página y con enlace de retorno', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Integración numérica')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
  expect(errores).toEqual([])
})

test('trapecio n = 4: 4.75 MB, error 1/12, tabla de pesos y gráfico', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de trapecio compuesto' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('4.75')
  await expect(calc.locator('dd', { hasText: /^0\.083333/ })).toBeVisible()
  const tabla = calc.getByRole('table', { name: /Nodos, pesos y sumas parciales/ })
  await expect(tabla.getByRole('row')).toHaveCount(6)
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('Simpson n = 4 da 14/3 y n = 3 se rechaza', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de Simpson 1/3 compuesto' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('4.6666666667')
  await calc.getByRole('button', { name: /n = 3/ }).click()
  await expect(calc.getByRole('alert')).toContainText('n par')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('n = 0 se rechaza en el trapecio', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: 'Calculadora de trapecio compuesto' })
  await calc.getByRole('button', { name: /n = 0/ }).click()
  await expect(calc.getByRole('alert')).toContainText('entero positivo')
})

test('coeficientes editables: ejercicio 2 (Simpson 36, trapecio 37)', async ({ page }) => {
  await page.goto(url)
  const calc = page.getByRole('region', { name: /Comparación: trapecio/ })
  await calc.getByLabel('a (MB/s³)').fill('3')
  await calc.getByLabel('b (MB/s²)').fill('2')
  await calc.getByLabel('Inicio (s)').fill('1')
  await calc.getByLabel('Fin (s)').fill('3')
  await calc.getByLabel('Subintervalos n').fill('2')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const tabla = calc.getByRole('table', { name: 'Resultados con n = 2' })
  await expect(tabla.getByRole('row').nth(1)).toContainText('37')
  await expect(tabla.getByRole('row').nth(2)).toContainText('36')
})

test('comparación: refinar n = 2, 4, 8 y dos gráficos', async ({ page }) => {
  await page.goto(url)
  const cmp = page.getByRole('region', { name: /Comparación: trapecio/ })
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  const tabla = cmp.getByRole('table', { name: /Refinar la partición/ })
  await expect(tabla.getByRole('row')).toHaveCount(4)
  await expect(tabla).toContainText('4.6875')
  await expect(cmp.locator('.main-svg').nth(0)).toBeVisible()
  await cmp.screenshot({ path: 'test-results/m4-comparacion.png' })
})

test('ficha de derivación central: 2 MB/s² con t = 1 y h = 0.1', async ({ page }) => {
  await page.goto(url)
  const tabla = page.getByRole('table', { name: /Diferencia central/ })
  await expect(tabla.getByRole('row').nth(2)).toContainText('0.1')
  await expect(tabla.getByRole('row').nth(2)).toContainText('2')
})

test('ejercicios con solución oculta y autoevaluación', async ({ page }) => {
  await page.goto(url)
  await page.getByRole('button', { name: 'Ver solución del ejercicio 4' }).click()
  await expect(page.locator('#sol-m4-e4')).toContainText('116')
  await page.getByRole('button', { name: /Comprobar respuestas/ }).click()
  await expect(page.getByText(/Puntaje: 0 de 6/)).toBeVisible()
})
