import { test, expect } from '@playwright/test'
import { base, calculadora } from './ayudas'

const GAUSS = 'Calculadora de eliminación con pivoteo parcial'
const GS = 'Calculadora de Gauss-Seidel'

test('ejercicio 1: eliminación de Gauss da (7, 7, 25)', async ({ page }) => {
  await page.goto(base + '#/sistemas/directos')
  const c = await calculadora(page, GAUSS, 'gauss')
  await c.getByRole('button', { name: 'Ejercicio 1 (3×3)' }).click()
  const sol = c.getByRole('table', { name: /Solución/ })
  await expect(sol.getByRole('row').nth(1)).toContainText('7')
  await expect(sol.getByRole('row').nth(3)).toContainText('25')
  await expect(c.getByRole('status')).toContainText('Solución obtenida')
})

test('ejercicio 2: sistema 4×4 da (31, 37, −34, 19)', async ({ page }) => {
  await page.goto(base + '#/sistemas/directos')
  const c = await calculadora(page, GAUSS, 'gauss')
  await c.getByRole('button', { name: 'Ejercicio 2 (4×4)' }).click()
  const filas = c.getByRole('table', { name: /Solución/ }).getByRole('row')
  await expect(filas).toHaveCount(5)
  await expect(filas.nth(1)).toContainText('31')
  await expect(filas.nth(2)).toContainText('37')
  await expect(filas.nth(3)).toContainText('−34')
  await expect(filas.nth(4)).toContainText('19')
  await expect(c.getByLabel('Tamaño del sistema')).toHaveValue('4')
  await c.screenshot({ path: 'test-results/m2-ejercicio2.png' })
})

test('ejercicio 3: x0 = (1,1,1), tol 1e-4 y orden reordenado converge a (1, −2, 3)', async ({ page }) => {
  await page.goto(base + '#/sistemas/iterativos')
  const c = await calculadora(page, GS, 'gs')
  await c.getByRole('button', { name: /^Ejercicio 3 \(x₀/ }).click()
  await expect(c.getByRole('status')).toContainText('convergio')
  await expect(c.locator('dt', { hasText: 'Orden de ecuaciones' })).toBeVisible()
  await expect(c.getByText('filas 2, 3, 1 del sistema original').first()).toBeVisible()
  await expect(c.getByLabel('Valor inicial de x1')).toHaveValue('1')
  await expect(c.getByLabel('Tolerancia')).toHaveValue('0.0001')
  await expect(c.getByText(/x1 = 0\.99999/)).toBeVisible()
  await expect(c.getByText(/x2 = −1\.99998/)).toBeVisible()
  await expect(c.getByText(/x3 = 2\.99999/)).toBeVisible()
  await c.screenshot({ path: 'test-results/m2-ejercicio3.png' })
})

test('ejercicio 3 sin reordenar: no converge y sugiere reordenar', async ({ page }) => {
  await page.goto(base + '#/sistemas/iterativos')
  const c = await calculadora(page, GS, 'gs')
  await c.getByRole('button', { name: 'Ejercicio 3 sin reordenar' }).click()
  await expect(c.getByRole('alert')).toContainText('reordenar')
  await expect(c.getByRole('alert')).not.toContainText('Correcto')
  await expect(c.getByText(/^Solución/)).toHaveCount(0)
})

test('el vector inicial es editable y descarta el resultado anterior', async ({ page }) => {
  await page.goto(base + '#/sistemas/iterativos')
  const c = await calculadora(page, GS, 'gs')
  await c.getByRole('button', { name: 'Calcular' }).click()
  await expect(c.getByRole('table').first()).toBeVisible()
  await c.getByLabel('Valor inicial de x2').fill('5')
  await expect(c.getByRole('table')).toHaveCount(0)
  await c.getByLabel('Valor inicial de x3').fill('abc')
  await c.getByRole('button', { name: 'Calcular' }).click()
  await expect(c.getByText('Ingresa un número.')).toBeVisible()
})
