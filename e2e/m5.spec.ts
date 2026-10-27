import { test, expect } from '@playwright/test'
import { base, calculadora } from './ayudas'

const url = base + '#/diferenciales'
const EULER = 'Calculadora de Euler explícito'
const RK4 = 'Calculadora de Runge-Kutta 4'

test.beforeEach(async ({ page }) => {
  const errores: string[] = []
  page.on('pageerror', (e) => errores.push(e.message))
  ;(page as unknown as { __errores: string[] }).__errores = errores
})
test.afterEach(async ({ page }) => {
  expect((page as unknown as { __errores: string[] }).__errores).toEqual([])
})

test('portada del tema: título, glosario, subnavegación y enlace de retorno', async ({ page }) => {
  await page.goto(url)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ecuaciones diferenciales')
  const sub = page.getByRole('navigation', { name: /Páginas de ecuaciones diferenciales/ })
  await expect(sub.getByRole('link')).toHaveCount(4)
  await expect(sub.getByRole('link', { name: 'Planteo y decisión' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#glosario dt')).toHaveCount(8)
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
})

test('Euler: T(0.5) = 65, tabla con incrementos y error, y dos gráficos', async ({ page }) => {
  await page.goto(url + '/euler')
  const calc = await calculadora(page, EULER, 'euler')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const tabla = calc.getByRole('table', { name: /Nodos de Euler/ })
  await expect(tabla.getByRole('row')).toHaveCount(6)
  await expect(tabla.getByRole('row').nth(2)).toContainText('65')
  await expect(tabla.getByRole('row').nth(2)).toContainText('−15')
  await expect(calc.locator('.main-svg')).not.toHaveCount(0)
  await calc.screenshot({ path: 'test-results/m5-euler.png' })
})

test('RK4: T(0.5) = 66.728515625 y las cuatro pendientes del primer paso', async ({ page }) => {
  await page.goto(url + '/rk4')
  const calc = await calculadora(page, RK4, 'rk4')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('table', { name: /Nodos de Runge-Kutta 4/ }).getByRole('row').nth(2)).toContainText('66.728515625')
  const k = calc.getByRole('table', { name: /cuatro pendientes/ })
  for (const v of ['−30', '−26.25', '−26.71875', '−23.3203125']) await expect(k).toContainText(v)
})

test('h = 5 en 20 min: Euler se declara inestable y no una solución válida (sin confundir con física)', async ({ page }) => {
  await page.goto(url + '/euler')
  const calc = await calculadora(page, EULER, 'euler')
  await calc.getByRole('button', { name: /Paso 5 en 20 min/ }).click()
  await expect(calc.getByRole('alert').first()).toContainText('no_converge')
  await expect(calc.getByRole('note').filter({ hasText: 'NO es físicamente válida' })).toBeVisible()
  await expect(calc.getByRole('table', { name: /Nodos de Euler/ })).toContainText('−182.5')
  await calc.screenshot({ path: 'test-results/m5-inestable.png' })
})

test('paso cero o negativo se rechaza', async ({ page }) => {
  await page.goto(url + '/euler')
  const calc = await calculadora(page, EULER, 'euler')
  await calc.getByRole('button', { name: /h = 0/ }).click()
  await expect(calc.getByRole('alert')).toContainText('no avanza')
  await calc.getByLabel('Paso h').fill('-1')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('invalido')
  await expect(calc.getByRole('table')).toHaveCount(0)
})

test('h = 0.3: el último paso es más corto y se registra', async ({ page }) => {
  await page.goto(url + '/euler')
  const calc = await calculadora(page, EULER, 'euler')
  await calc.getByRole('button', { name: /Paso 0.3/ }).click()
  await expect(calc.getByRole('note')).toContainText('último paso es más corto')
  const tabla = calc.getByRole('table', { name: /Nodos de Euler/ })
  await expect(tabla.getByRole('row')).toHaveCount(9)
  await expect(tabla.getByRole('row').last()).toContainText('último paso más corto')
  await expect(tabla.getByRole('row').last()).toContainText('0.2')
})

test('el modelo es editable: parámetros inválidos se marcan en el campo', async ({ page }) => {
  await page.goto(url + '/euler')
  const calc = await calculadora(page, EULER, 'euler')
  await calc.getByLabel('Constante de enfriamiento k').fill('abc')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByText('Ingresa un número.')).toBeVisible()
  await calc.getByLabel('Constante de enfriamiento k').fill('-1')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('0 < k')
})

test('comparación: Euler frente a RK4 con dos pasos y gráfico', async ({ page }) => {
  await page.goto(url)
  const cmp = page.getByRole('region', { name: /Comparación: Euler frente a RK4/ })
  await cmp.getByRole('button', { name: 'Calcular' }).click()
  const tabla = cmp.getByRole('table', { name: /Error máximo/ })
  await expect(tabla.getByRole('row')).toHaveCount(5)
  await expect(tabla).toContainText('3.0883914703')
  await expect(tabla).toContainText('0.0008854941')
  await expect(cmp.locator('.aviso')).toContainText('orden 1')
  await expect(cmp.locator('.main-svg').first()).toBeVisible()
  await cmp.screenshot({ path: 'test-results/m5-comparacion.png' })
})

test('explorador de estabilidad: h = 5 → Euler ✖ y RK4 ✔; h = 3 oscila', async ({ page }) => {
  await page.goto(url + '/estabilidad')
  const calc = await calculadora(page, 'Explorador de estabilidad', 'estabilidad')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  await expect(calc.getByRole('alert')).toContainText('Euler: ✖ inestable')
  await expect(calc.getByRole('status')).toContainText('RK4: ✔ estable')
  await expect(calc.getByRole('table', { name: /Factor por paso/ }).getByRole('row')).toHaveCount(9)
  await expect(calc.locator('.main-svg').first()).toBeVisible()
  await calc.getByRole('button', { name: /h = 3/ }).click()
  await expect(calc.getByText('Euler: ✔ estable')).toBeVisible()
  await calc.screenshot({ path: 'test-results/m5-estabilidad.png' })
})

test('Euler paso a paso: el explorador interactivo explica cada paso', async ({ page }) => {
  await page.goto(url + '/euler')
  const ex = page.getByRole('region', { name: 'Euler paso a paso' })
  await expect(ex).toContainText('Estado inicial')
  await ex.getByRole('button', { name: 'Dar un paso' }).click()
  await expect(ex).toContainText('Paso 1.')
  await expect(ex).toContainText('65')
  await ex.getByRole('button', { name: 'Dar un paso' }).click()
  await expect(ex).toContainText('Paso 2.')
  await ex.getByRole('button', { name: 'Retroceder' }).click()
  await expect(ex).toContainText('Paso 1.')
  await expect(ex.locator('.main-svg').first()).toBeVisible()
})

test('RK4: las cuatro pendientes dibujadas', async ({ page }) => {
  await page.goto(url + '/rk4')
  const ex = page.getByRole('region', { name: 'Las cuatro pendientes de RK4' })
  await expect(ex.locator('.main-svg').first()).toBeVisible()
  await expect(ex).toContainText('−23.32031')
  await ex.getByLabel('Paso h (min)').selectOption('0.25')
  await expect(ex).toContainText('Con h = 0.25')
})

test('analiza y decide: paso grande → plan que empieza por la estabilidad; ejercicio con plan abre Euler h = 5', async ({ page }) => {
  await page.goto(url)
  await page.getByRole('button', { name: 'Analizar este problema' }).nth(1).click()
  await expect(page.getByRole('heading', { name: /Euler explícito · ✖ No recomendado/ })).toBeVisible()
  const ej = page.locator('#ejercicios')
  await ej.getByRole('radio', { name: /Euler con h = 5/ }).check()
  await expect(ej.getByRole('status')).toContainText('No recomendado')
  await ej.getByRole('button', { name: /Probar este método en la calculadora/ }).click()
  await expect(page.getByRole('region', { name: EULER }).getByRole('alert').first()).toContainText('no_converge')
})

test('móvil: sin scroll horizontal con la calculadora abierta', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(url + '/estabilidad')
  const calc = await calculadora(page, 'Explorador de estabilidad', 'estabilidad')
  await calc.getByRole('button', { name: 'Calcular' }).click()
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  expect(sw).toBeLessThanOrEqual(cw)
})

test('el portal ya no tiene temas pendientes y lista Ecuaciones diferenciales', async ({ page }) => {
  await page.goto(base + '#/')
  await expect(page.getByText('Próximamente')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Estabilidad y tamaño de paso' })).toBeVisible()
})
