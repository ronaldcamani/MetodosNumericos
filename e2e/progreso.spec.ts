import { expect, test } from '@playwright/test'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const base = pathToFileURL(path.resolve('dist/index.html')).href
// Respuestas correctas: se obtienen revelando el desarrollo de OTRO problema no sirve (los valores cambian), así que
// el test verifica el flujo: fallar, ver que no se revela nada, abrir el desarrollo y comprobar que el avance persiste.
test('práctica por niveles: tres niveles, problemas nuevos, fallo sin spoiler y avance visible', async ({ page }) => {
  await page.goto(`${base}#/errores`)
  const sec = page.locator('#practica')
  await expect(sec.getByRole('group', { name: /Nivel de dificultad/ }).getByRole('button')).toHaveCount(3)
  await expect(sec.locator('.problema-generado')).toHaveCount(3)
  const antes = await sec.locator('.problemas-generados').innerText()
  await sec.getByRole('button', { name: /Generar problemas nuevos/ }).click()
  expect(await sec.locator('.problemas-generados').innerText()).not.toBe(antes)

  const t = sec.locator('.problema-generado').first()
  for (const c of await t.getByRole('textbox').all()) await c.fill('987654')
  await t.getByRole('button', { name: /Comprobar/ }).click()
  await expect(t.getByText(/no coincide/).first()).toBeVisible()
  await expect(t.locator('.paso-visible')).toHaveCount(0)

  await sec.getByRole('group', { name: /Nivel de dificultad/ }).getByRole('button', { name: /Avanzado/ }).click()
  await expect(sec.getByText(/Cada acierto vale 30 puntos/)).toBeVisible()
  await sec.locator('.problema-generado').first().getByRole('button', { name: /Ver el desarrollo paso a paso/ }).click()
  await sec.locator('.problema-generado').first().getByRole('button', { name: /Mostrar todos los pasos/ }).click()
  await expect(sec.locator('.problema-generado').first().locator('.paso-visible').first()).toBeVisible()
})

test('el avance se guarda en el navegador y aparece en la tarjeta del inicio', async ({ page }) => {
  await page.goto(base)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${base}#/errores`)
  // sembrar un avance equivalente a 6 aciertos básicos para comprobar la lectura desde el almacenamiento
  await page.evaluate(() => localStorage.setItem('portal-mn-progreso-v1', JSON.stringify({ errores: { puntos: 60, correctas: { basico: 6, intermedio: 0, avanzado: 0 }, intentos: { basico: 7, intermedio: 0, avanzado: 0 }, resueltos: [], estudiados: [] } })))
  await page.reload()
  const prog = page.locator('#practica').getByRole('region', { name: 'Tu progreso en este tema' })
  await expect(prog).toContainText('60 puntos')
  await expect(prog.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30')
  await page.goto(base)
  await expect(page.getByRole('progressbar', { name: 'Dominio de errores' })).toHaveAttribute('aria-valuenow', '30')
})

test('los seis temas ofrecen práctica por niveles', async ({ page }) => {
  for (const r of ['errores', 'ecuaciones', 'sistemas', 'interpolacion', 'integracion', 'diferenciales']) {
    await page.goto(`${base}#/${r}`)
    await expect(page.locator('#practica .problema-generado')).toHaveCount(3)
  }
})
