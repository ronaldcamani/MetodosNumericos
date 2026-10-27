import { test, expect } from '@playwright/test'
import { base, calculadora } from './ayudas'

const hub = base + '#/sistemas'
const directos = base + '#/sistemas/directos'
const iterativos = base + '#/sistemas/iterativos'
const GAUSS = 'Calculadora de eliminación con pivoteo parcial'
const GS = 'Calculadora de Gauss-Seidel'

test('portada del tema: título, subnavegación y enlace de retorno sin errores de página', async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(hub)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sistemas de ecuaciones lineales')
  const sub = page.getByRole('navigation', { name: /Páginas de sistemas/ })
  await expect(sub.getByRole('link')).toHaveCount(3)
  await expect(sub.getByRole('link', { name: 'Planteo y decisión' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
  await sub.getByRole('link', { name: 'Métodos directos' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Métodos directos')
  expect(errores).toEqual([])
})

test('eliminación: caso base da (1, 2, 3) y muestra matrices intermedias', async ({ page }) => {
  await page.goto(directos)
  const calc = await calculadora(page, GAUSS, 'gauss')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('Solución obtenida')
  const sol = calc.getByRole('table', { name: /Solución/ })
  await expect(sol).toContainText('x1')
  await expect(sol.getByRole('cell', { name: '1', exact: true })).toBeVisible()
  await expect(calc.getByRole('table', { name: /tras el paso 2/ })).toBeVisible()
})

test('eliminación: sistema singular advierte y no muestra solución', async ({ page }) => {
  await page.goto(directos)
  const calc = await calculadora(page, GAUSS, 'gauss')
  await calc.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(calc.getByRole('alert')).toContainText('singular')
  await expect(calc.getByRole('table', { name: /Solución/ })).toHaveCount(0)
})

test('Gauss-Seidel: primera iteración (2.25, 2.35, 2.7333333333) y gráficos', async ({ page }) => {
  await page.goto(iterativos)
  const calc = await calculadora(page, GS, 'gs')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const fila1 = calc.getByRole('table', { name: /Iteraciones de Gauss-Seidel/ }).getByRole('row').nth(1)
  await expect(fila1).toContainText('2.25')
  await expect(fila1).toContainText('2.35')
  await expect(fila1).toContainText('2.7333333333')
  await expect(calc.locator('.main-svg').first()).toBeVisible()
  await expect(calc.getByText('Sí (condición suficiente')).toBeVisible()
})

test('Gauss-Seidel: tamaño 2 y límite de iteraciones no es convergencia', async ({ page }) => {
  await page.goto(iterativos)
  const calc = await calculadora(page, GS, 'gs')
  await calc.getByLabel('Máximo de iteraciones').fill('2')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('max_iter')
  await calc.getByLabel('Tamaño del sistema').selectOption('2')
  await expect(calc.getByLabel('a33')).toHaveCount(0)
})

test('coeficiente inválido se marca y no calcula', async ({ page }) => {
  await page.goto(iterativos)
  const calc = await calculadora(page, GS, 'gs')
  await calc.getByLabel('a12', { exact: true }).fill('x')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('números')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('comparación: singular no oculta nada y caso base coincide', async ({ page }) => {
  await page.goto(hub)
  const cmp = page.getByRole('region', { name: /Comparación: método directo/ })
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  await expect(cmp.getByText(/Diferencia entre ambas soluciones/)).toBeVisible()
  await cmp.getByRole('button', { name: /Probar fallo/ }).click()
  await expect(cmp.getByRole('alert')).toHaveCount(2)
  await cmp.screenshot({ path: 'test-results/m2-comparacion.png' })
})

test('analiza y decide: red grande y dominante → Gauss-Seidel recomendado y se prueba en la calculadora', async ({ page }) => {
  await page.goto(hub)
  await page.getByRole('button', { name: 'Analizar este problema' }).nth(1).click()
  await expect(page.getByRole('heading', { name: /Gauss-Seidel · ✔ Recomendado/ })).toBeVisible()
  await page.getByRole('button', { name: /Probar Gauss-Seidel en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: GS })
  await expect(calc.getByRole('status')).toContainText('convergio')
})

test('ejercicio con plan: sistema no dominante tal cual no converge y reordenado sí', async ({ page }) => {
  await page.goto(hub)
  const ej = page.locator('#ejercicios')
  await ej.getByRole('radio', { name: /Gauss-Seidel con las ecuaciones tal como están/ }).check()
  await expect(ej.getByRole('status')).toContainText('No recomendado')
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: GS })
  await expect(calc.getByRole('alert')).toContainText('reordenar')
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await ej.getByRole('radio', { name: /Gauss-Seidel reordenando/ }).check()
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).first().click()
  await expect(calc.getByRole('status')).toContainText('convergio')
})

test('móvil sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(iterativos)
  const calc = await calculadora(page, GS, 'gs')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  expect(sw).toBeLessThanOrEqual(cw)
})
