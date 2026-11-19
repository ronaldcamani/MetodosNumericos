import { expect, test } from '@playwright/test'
import { base } from './ayudas'

const RUTAS = [
  '',
  'errores',
  'ecuaciones',
  'sistemas',
  'interpolacion',
  'integracion',
  'diferenciales',
]

test('portada y los 6 módulos abren siempre arriba (scrollY === 0) sin saltar a autoevaluación', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  for (const r of RUTAS) {
    await page.goto(`${base}#/${r}`)
    await page.waitForSelector('h1')
    // Esperar a que PlotlyLazy y cualquier efecto diferido monten completamente
    await page.waitForTimeout(900)
    const y = await page.evaluate(() => window.scrollY)
    expect(y, `window.scrollY debe ser 0 en #/${r || ''}`).toBe(0)
    const focoEnFondo = await page.evaluate(() => {
      const el = document.activeElement
      return Boolean(el?.closest('#ejercicios, #autoevaluacion, #practica'))
    })
    expect(focoEnFondo, `no debe haber foco automático en zonas inferiores en #/${r || ''}`).toBe(false)
  }
})

test('al desplazarse abajo en un módulo y navegar a otro, el nuevo módulo abre en scrollY === 0', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(`${base}#/ecuaciones`)
  await page.waitForSelector('#autoevaluacion')
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200)

  await page.getByRole('navigation', { name: 'Temas' }).getByRole('link', { name: 'Diferenciales' }).click()
  await page.waitForSelector('h1')
  await page.waitForTimeout(900)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
