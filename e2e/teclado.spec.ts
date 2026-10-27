import { test, expect, type Page } from '@playwright/test'
import { base } from './ayudas'

const RUTAS = ['', 'recursos', 'errores', 'ecuaciones', 'ecuaciones/cerrados', 'ecuaciones/abiertos', 'ecuaciones/polinomios', 'sistemas', 'sistemas/directos', 'sistemas/iterativos', 'interpolacion', 'interpolacion/lagrange', 'interpolacion/regresion', 'integracion', 'integracion/trapecio', 'integracion/simpson', 'integracion/derivacion', 'diferenciales', 'diferenciales/euler', 'diferenciales/rk4', 'diferenciales/estabilidad']

test('idioma de la página y título', async ({ page }) => {
  await page.goto(base)
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('es')
  expect(await page.title()).not.toBe('')
})

test('jerarquía de encabezados: nunca se salta un nivel y hay un solo h1 en cada página', async ({ page }) => {
  for (const r of RUTAS) {
    await page.goto(`${base}#/${r}`)
    await page.waitForSelector('h1')
    const niveles = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')].map((h) => Number(h.tagName[1])))
    expect(niveles.filter((n) => n === 1), `h1 en ${r || 'inicio'}`).toHaveLength(1)
    niveles.forEach((n, i) => {
      if (i > 0) expect(n, `salto de nivel en ${r || 'inicio'}: ${niveles[i - 1]} → ${n}`).toBeLessThanOrEqual(niveles[i - 1] + 1)
    })
  }
})

test('puntos de referencia: un solo main, navegaciones con nombre único y tablas con título', async ({ page }) => {
  for (const r of ['ecuaciones', 'diferenciales/estabilidad', 'recursos']) {
    await page.goto(`${base}#/${r}`)
    expect(await page.locator('main').count()).toBe(1)
    const nombres = await page.locator('nav').evaluateAll((ns) => ns.map((n) => n.getAttribute('aria-label')))
    expect(nombres.every(Boolean)).toBe(true)
    expect(new Set(nombres).size).toBe(nombres.length)
    expect(await page.locator('table:not(:has(caption))').count()).toBe(0)
  }
})

async function conFoco(page: Page, veces: number) {
  const sinIndicador: string[] = []
  for (let i = 0; i < veces; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const visible = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
      const sombra = cs.boxShadow !== 'none'
      return { etiqueta: el.tagName + (el.getAttribute('aria-label') ?? el.textContent ?? '').slice(0, 30), ok: visible || sombra }
    })
    if (r && !r.ok) sinIndicador.push(r.etiqueta)
  }
  return sinIndicador
}

test('todos los controles enfocados con Tab muestran un indicador de foco visible', async ({ page }) => {
  for (const r of ['ecuaciones', 'diferenciales/euler']) {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(`${base}#/${r}`)
    expect(await conFoco(page, 45), `controles sin foco visible en ${r}`).toEqual([])
  }
})

test('enlace «Saltar al contenido» lleva el foco al contenido principal', async ({ page }) => {
  await page.goto(`${base}#/diferenciales`)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /saltar al contenido/i })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#contenido')).toBeFocused()
})

test('las tablas con desplazamiento se pueden enfocar con el teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(`${base}#/ecuaciones`)
  const envolturas = await page.locator('.tabla-wrap').evaluateAll((els) => els.map((e) => e.getAttribute('tabindex')))
  expect(envolturas.length).toBeGreaterThan(0)
  expect(envolturas.every((t) => t === '0')).toBe(true)
})

test('«Analiza y decide» se maneja solo con teclado: las flechas cambian la respuesta y la recomendación', async ({ page }) => {
  await page.goto(`${base}#/sistemas`)
  const grupo = page.getByRole('group', { name: /singular o casi singular/ })
  await grupo.getByRole('radio', { name: 'No' }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(grupo.getByRole('radio', { name: 'Sí' })).toBeChecked()
  await expect(page.getByRole('heading', { name: /Gauss-Seidel · ✖ No recomendado/ })).toBeVisible()
})

test('plan de solución, pista y solución con teclado, y el resultado se anuncia (role=status)', async ({ page }) => {
  await page.goto(`${base}#/diferenciales`)
  const ej = page.locator('#ejercicios')
  const radio = ej.getByRole('radio', { name: /Euler con h = 0\.5$/ }).first()
  await radio.focus()
  await page.keyboard.press('Space')
  await expect(ej.getByRole('status').first()).toBeVisible()
  const pista = ej.getByRole('button', { name: /Ver pista del ejercicio 1/ })
  await pista.focus()
  await page.keyboard.press('Enter')
  await expect(ej.getByRole('button', { name: /Ocultar pista del ejercicio 1/ })).toHaveAttribute('aria-expanded', 'true')
})

test('autoevaluación con teclado: Enter en un campo numérico corrige y «Profundiza» se abre con Enter', async ({ page }) => {
  await page.goto(`${base}#/diferenciales/euler`)
  const auto = page.locator('#autoevaluacion')
  await auto.getByRole('textbox').first().fill('-15')
  await auto.getByRole('textbox').first().press('Enter')
  await expect(auto.getByText(/Puntaje: 1 de 3/)).toBeVisible()
  const resumen = auto.locator('details summary').first()
  await resumen.focus()
  await page.keyboard.press('Enter')
  await expect(auto.locator('details').first()).toHaveAttribute('open', '')
})

test('calculadora con teclado: Enter en un campo calcula y el resultado está en una región aria-live', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`${base}#/ecuaciones/cerrados`)
  await page.getByRole('button', { name: 'Abrir calculadora', expanded: false }).focus()
  await page.keyboard.press('Enter')
  const panel = page.getByRole('complementary', { name: 'Panel de calculadora' })
  await expect(panel).toBeFocused()
  const calc = page.getByRole('region', { name: 'Calculadora de raíces' })
  await calc.getByLabel('Tolerancia').focus()
  await page.keyboard.press('Enter')
  await expect(calc.locator('.salida[aria-live="polite"]').getByRole('status')).toContainText('convergio')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})

test('el estado nunca depende solo del color: ✔, ⚠ y ✖ acompañan al texto', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`${base}#/diferenciales/euler`)
  await page.getByRole('button', { name: 'Abrir calculadora', expanded: false }).click()
  const calc = page.getByRole('region', { name: 'Calculadora de Euler explícito' })
  await calc.getByRole('button', { name: /Paso 5 en 20 min/ }).click()
  await expect(calc.getByRole('alert').first()).toContainText('Sin convergencia')
  await expect(calc.getByRole('note').first()).toContainText('⚠')
})

test('con movimiento reducido no hay desplazamientos animados del cajón', async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
  await page.goto(`${base}#/ecuaciones/cerrados`)
  const t = await page.evaluate(() => getComputedStyle(document.getElementById('panel-calculadora')!).transform)
  expect(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
})

test('zoom 200 %: el contenido sigue siendo legible sin scroll horizontal (viewport 640 px equivalente)', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 })
  for (const r of ['ecuaciones', 'sistemas/directos', 'diferenciales/estabilidad']) {
    await page.goto(`${base}#/${r}`)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  }
})
