import { test, expect, type Page } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const url = pathToFileURL(path.resolve('dist/index.html')).href + '#/errores'

async function abrir(page: Page) {
  await page.getByRole('button', { name: 'Abrir calculadora', expanded: false }).click()
  await expect(page.getByRole('complementary', { name: 'Panel de calculadora' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  ;(page as unknown as { __errores: string[] }).__errores = errores
})
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errores: string[] }).__errores).toEqual([])
})

test('el portal lista Errores como módulo aparte con enlace de retorno', async ({ page }) => {
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Errores y aritmética de computador')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
  await page.getByRole('link', { name: /volver al portal/i }).click()
  await expect(page.getByRole('heading', { name: /Errores y aritmética de computador/ })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Temas' }).getByRole('link', { name: 'Errores' })).toBeVisible()
})

test('error de una aproximación: π ≈ 3.1416 da 5 cifras correctas', async ({ page }) => {
  await page.goto(url)
  await abrir(page)
  const calc = page.getByRole('region', { name: 'Calculadora de error de una aproximación' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.locator('dd').nth(0)).toContainText('7.3464')
  await expect(calc.getByText('Cifras significativas correctas').locator('xpath=following-sibling::dd[1]')).toHaveText('5')
})

test('aritmética de 4 cifras: la resta de casi iguales avisa de cancelación y con truncamiento da 0', async ({ page }) => {
  await page.goto(url)
  await abrir(page)
  await page.getByLabel('Herramienta').selectOption('operacion')
  const calc = page.getByRole('region', { name: 'Calculadora de aritmética de t cifras' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('note')).toContainText('cancelación catastrófica')
  await calc.getByRole('button', { name: 'Mismo caso con truncamiento' }).click()
  await expect(calc.getByRole('table', { name: 'Operandos y resultado' })).toContainText('0.1234')
  await calc.screenshot({ path: 'test-results/errores-cancelacion.png' })
})

test('t inválido y división entre 0 se informan como error', async ({ page }) => {
  await page.goto(url)
  await abrir(page)
  await page.getByLabel('Herramienta').selectOption('operacion')
  const calc = page.getByRole('region', { name: 'Calculadora de aritmética de t cifras' })
  await calc.getByLabel('Cifras significativas t').fill('0')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('invalido')
  await calc.getByLabel('Cifras significativas t').fill('4')
  await calc.getByLabel('Operación').selectOption('÷')
  await calc.getByLabel('Segundo número b').fill('0')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('dividir entre 0')
})

test('orden de la suma y gráfico de sumas parciales', async ({ page }) => {
  await page.goto(url)
  await abrir(page)
  await page.getByLabel('Herramienta').selectOption('suma')
  const calc = page.getByRole('region', { name: 'Calculadora de orden de la suma' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('status')).toContainText('en el orden dado 1000; en orden creciente 1001')
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('serie de eˣ: el error baja al añadir términos y se muestra el gráfico', async ({ page }) => {
  await page.goto(url)
  await abrir(page)
  await page.getByLabel('Herramienta').selectOption('serie')
  const calc = page.getByRole('region', { name: 'Calculadora de truncamiento de series' })
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('table', { name: /Maclaurin/ }).getByRole('row')).toHaveCount(9)
  await expect(calc.locator('.main-svg').first()).toBeVisible()
})

test('el ejercicio de cancelación: elegir restar directamente abre la herramienta con los datos y avisa', async ({ page }) => {
  await page.goto(url)
  const ej = page.locator('#ejercicios')
  await ej.getByRole('radio', { name: /Restar directamente las dos raíces/ }).check()
  await expect(ej.getByRole('status')).toContainText('No recomendado')
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de aritmética de t cifras' })
  await expect(calc.getByRole('note')).toContainText('cancelación catastrófica')
  await expect(calc.getByLabel('Primer número a')).toHaveValue('100.00499987500625')
})
