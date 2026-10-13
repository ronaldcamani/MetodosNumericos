import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const base = pathToFileURL(path.resolve('dist/index.html')).href

const fondo = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test('sigue al dispositivo: claro por defecto y oscuro si el sistema es oscuro', async ({ browser }) => {
  const claro = await browser.newPage({ colorScheme: 'light' })
  await claro.goto(base + '#/')
  expect(await fondo(claro)).toBe('rgb(250, 250, 250)')
  const oscuro = await browser.newPage({ colorScheme: 'dark' })
  await oscuro.goto(base + '#/')
  expect(await fondo(oscuro)).toBe('rgb(20, 23, 26)')
})

test('selector de tema fuerza claro/oscuro y se recuerda', async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: 'light' })
  await page.goto(base + '#/')
  const grupo = page.getByRole('group', { name: 'Tema de color' })
  await grupo.getByRole('button', { name: 'Oscuro' }).click()
  expect(await fondo(page)).toBe('rgb(20, 23, 26)')
  await page.reload()
  expect(await fondo(page)).toBe('rgb(20, 23, 26)')
  await grupo.getByRole('button', { name: 'Auto' }).click()
  expect(await fondo(page)).toBe('rgb(250, 250, 250)')
})

test('índice lateral: salta a la sección y marca la activa', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(base + '#/m2')
  const indice = page.getByRole('navigation', { name: 'Secciones del módulo' })
  await expect(indice).toBeVisible()
  await indice.getByRole('link', { name: 'Calculadora: Gauss-Seidel' }).click()
  await expect(indice.getByRole('link', { name: 'Calculadora: Gauss-Seidel' })).toHaveAttribute('aria-current', 'location')
  await expect.poll(() => page.evaluate(() => document.getElementById('gs')!.getBoundingClientRect().top)).toBeLessThan(200)
  // el índice sigue a la vista sin volver arriba
  await expect(indice).toBeInViewport()
})

test('en móvil el índice es desplegable y no hay scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto(base + '#/m1')
  const boton = page.getByRole('button', { name: /Secciones del módulo/ })
  await expect(page.getByRole('navigation', { name: 'Secciones del módulo' })).toBeHidden()
  await boton.click()
  await page.getByRole('link', { name: 'Calculadora: Newton' }).click()
  await expect(page.getByRole('navigation', { name: 'Secciones del módulo' })).toBeHidden()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
