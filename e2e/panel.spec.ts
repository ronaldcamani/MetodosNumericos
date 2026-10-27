import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const base = pathToFileURL(path.resolve('dist/index.html')).href + '#/ecuaciones/cerrados'

test('pantalla ancha: la calculadora se acopla al lado del contenido', async ({ page }) => {
  await page.setViewportSize({ width: 1700, height: 900 })
  await page.goto(base)
  const panel = page.getByRole('complementary', { name: 'Panel de calculadora' })
  await expect(panel).toBeVisible()
  const contenido = page.locator('.con-panel-contenido')
  const [p, c] = await Promise.all([panel.boundingBox(), contenido.boundingBox()])
  expect(p!.x).toBeGreaterThanOrEqual(c!.x + c!.width - 1) // al lado, sin cubrir el contenido
  await page.getByRole('button', { name: 'Cerrar' }).click()
  await expect(panel).toBeHidden()
  await expect(page.getByRole('button', { name: 'Abrir calculadora', expanded: false })).toBeFocused()
})

test('pantalla estrecha: cajón que se abre con el botón, se cierra con Escape y devuelve el foco', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(base)
  const panel = page.getByRole('complementary', { name: 'Panel de calculadora' })
  await expect(panel).toBeHidden()
  const boton = page.getByRole('button', { name: 'Abrir calculadora', expanded: false })
  await boton.click()
  await expect(panel).toBeVisible()
  await panel.getByLabel('Tolerancia').focus()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(boton).toBeFocused()
})

test('un botón «Probar» abre el panel con el método y los datos precargados y mueve el foco', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(base)
  await page.locator('#verificacion').getByRole('button', { name: 'probar [2, 3]' }).click()
  const panel = page.getByRole('complementary', { name: 'Panel de calculadora' })
  await expect(panel).toBeVisible()
  await expect(panel.getByLabel('Método')).toHaveValue('falsa')
  await expect(panel.getByLabel('Extremo a')).toHaveValue('2')
  await expect(panel.getByRole('alert')).toContainText('mismo signo')
  await expect(panel).toBeFocused()
})

test('el panel cerrado no es alcanzable con el teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(base)
  const fuera = await page.evaluate(() => {
    const aside = document.getElementById('panel-calculadora')!
    return aside.inert && aside.getAttribute('aria-hidden') === 'true'
  })
  expect(fuera).toBe(true)
})

test('movimiento: el botón se comprime al pulsar y el cajón respeta prefers-reduced-motion', async ({ browser }) => {
  const normal = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await normal.goto(base)
  const boton = normal.getByRole('button', { name: 'Abrir calculadora', expanded: false })
  const transform = await boton.evaluate((el) => {
    // :active no se puede forzar desde JS; se comprueba que la regla existe y que la transición es solo de propiedades concretas
    const reglas = [...document.styleSheets].flatMap((h) => [...h.cssRules]).map((r) => r.cssText).join('\n')
    return { tieneActive: /button:active[^{]*\{[^}]*scale\(0\.97\)/.test(reglas), sinAll: !/transition:\s*all/.test(reglas), transicion: getComputedStyle(el).transitionProperty }
  })
  expect(transform.tieneActive).toBe(true)
  expect(transform.sinAll).toBe(true)
  expect(transform.transicion).not.toBe('all')
  const reducido = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  await reducido.goto(base)
  const t = await reducido.evaluate(() => getComputedStyle(document.getElementById('panel-calculadora')!).transform)
  expect(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
})
