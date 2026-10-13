import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const base = pathToFileURL(path.resolve('dist/index.html')).href

for (const [mod, sol1] of [['m1', /n = 10/], ['m2', /1\.00010001/]] as const) {
  test(`${mod}: ejercicios con solución oculta y autoevaluación corregible`, async ({ page }) => {
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(e.message))
    await page.goto(`${base}#/${mod}`)
    const sec = page.locator('#ejercicios')
    await expect(sec.getByRole('heading', { level: 3 })).toHaveCount(4)
    await expect(sec.getByText(sol1)).toHaveCount(0)
    await sec.getByRole('button', { name: /Ver solución del ejercicio 1/ }).click()
    await expect(sec.getByText(sol1).first()).toBeVisible()
    await expect(sec.getByRole('button', { name: /Ocultar solución del ejercicio 1/ })).toHaveAttribute('aria-expanded', 'true')

    const auto = page.locator('#autoevaluacion')
    await expect(auto.getByRole('group')).toHaveCount(6)
    await auto.getByRole('button', { name: 'Comprobar respuestas' }).click()
    await expect(auto.getByText('Puntaje: 0 de 6')).toBeVisible()
    await expect(auto.getByText('Sin responder').first()).toBeVisible()
    expect(errores).toEqual([])
  })
}

test('m1: respuestas correctas dan 6 de 6', async ({ page }) => {
  await page.goto(`${base}#/m1`)
  const auto = page.locator('#autoevaluacion')
  await auto.getByRole('radio', { name: /f\(a\)·f\(b\) < 0 con f continua/ }).check()
  await auto.getByRole('group', { name: 'Pregunta 2' }).getByRole('radio', { name: 'Falso' }).check()
  await auto.getByRole('textbox').nth(0).fill('20')
  await auto.getByRole('radio', { name: /f′\(xₙ\) = 0/ }).check()
  await auto.getByRole('textbox').nth(1).fill('3.75')
  await auto.getByRole('group', { name: 'Pregunta 6' }).getByRole('radio', { name: 'Falso' }).check()
  await auto.getByRole('button', { name: 'Comprobar respuestas' }).click()
  await expect(auto.getByText('Puntaje: 6 de 6')).toBeVisible()
})
