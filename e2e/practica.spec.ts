import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const base = pathToFileURL(path.resolve('dist/index.html')).href

for (const [mod, sol1, ejercicios, preguntas] of [['ecuaciones/cerrados', /n = 10/, 4, 6], ['ecuaciones/abiertos', /1\.4142157/, 4, 6], ['ecuaciones/polinomios', /p\(3\) = 5/, 4, 6], ['errores', /0\.04025/, 4, 6], ['sistemas/directos', /1\.00010001/, 2, 3], ['sistemas/iterativos', /Iteración 1/, 2, 3], ['interpolacion/lagrange', /como debe ocurrir/, 2, 3], ['interpolacion/regresion', /y=0\.5\+1\.4x/, 2, 3], ['integracion/trapecio', /4\.75/, 2, 3], ['integracion/simpson', /36/, 2, 3], ['integracion/derivacion', /2\.1/, 2, 3], ['diferenciales/euler', /el error crece de un paso/, 2, 3], ['diferenciales/rk4', /frente a 1\.73/, 2, 3], ['diferenciales/estabilidad', /Cuanto más rápido es el fenómeno/, 2, 3]] as const) {
  test(`${mod}: ejercicios con solución oculta y autoevaluación corregible`, async ({ page }) => {
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(e.message))
    await page.goto(`${base}#/${mod}`)
    const sec = page.locator('#ejercicios')
    await expect(sec.getByRole('heading', { level: 3 })).toHaveCount(ejercicios)
    await expect(sec.getByText(sol1)).toHaveCount(0)
    await sec.getByRole('button', { name: /Mostrar todos los pasos de ejercicio 1/ }).click()
    await expect(sec.getByText(sol1).first()).toBeVisible()
    await expect(sec.getByRole('button', { name: /Ocultar los pasos de ejercicio 1/ })).toBeVisible()

    const auto = page.locator('#autoevaluacion')
    await expect(auto.getByRole('group')).toHaveCount(preguntas)
    await auto.getByRole('button', { name: 'Comprobar respuestas' }).click()
    await expect(auto.getByText(`Puntaje: 0 de ${preguntas}`)).toBeVisible()
    await expect(auto.getByText('Sin responder').first()).toBeVisible()
    expect(errores).toEqual([])
  })
}

test('métodos cerrados: respuestas correctas dan 6 de 6 y cada pregunta explica más', async ({ page }) => {
  await page.goto(`${base}#/ecuaciones/cerrados`)
  const auto = page.locator('#autoevaluacion')
  await auto.getByRole('radio', { name: /f\(a\)·f\(b\) < 0 con f continua/ }).check()
  await auto.getByRole('textbox').nth(0).fill('20')
  await auto.getByRole('group', { name: 'Pregunta 3' }).getByRole('radio', { name: 'Falso' }).check()
  await auto.getByRole('radio', { name: /un extremo puede quedarse fijo/ }).check()
  await auto.getByRole('textbox').nth(1).fill('1.3333')
  await auto.getByRole('group', { name: 'Pregunta 6' }).getByRole('radio', { name: 'Verdadero' }).check()
  await auto.getByRole('button', { name: 'Comprobar respuestas' }).click()
  await expect(auto.getByText('Puntaje: 6 de 6')).toBeVisible()
  await expect(auto.locator('details summary')).toHaveCount(6)
  await expect(auto.getByText(/Sobre tu elección/).first()).toBeVisible()
  const detalle = auto.locator('details').first()
  await expect(detalle).not.toHaveAttribute('open', '')
  await detalle.getByText('Profundiza').click()
  await expect(detalle).toHaveAttribute('open', '')
  await expect(detalle.getByText(/número par/)).toBeVisible()
})

test('ejercicios: sin pistas; la solución se revela una tarjeta a la vez', async ({ page }) => {
  await page.goto(`${base}#/ecuaciones/cerrados`)
  const ej = page.locator('#ejercicios')
  await expect(ej.getByRole('button', { name: /pista/i })).toHaveCount(0)
  const primero = ej.locator('.ejercicio').first()
  await expect(primero.locator('.paso-visible')).toHaveCount(0)
  await primero.getByRole('button', { name: /Mostrar siguiente paso \(1 de/ }).click()
  await expect(primero.locator('.paso-visible')).toHaveCount(1)
  await primero.getByRole('button', { name: /Mostrar siguiente paso \(2 de/ }).click()
  await expect(primero.locator('.paso-visible')).toHaveCount(2)
  await primero.getByRole('textbox', { name: /Tu desarrollo del ejercicio 1/ }).fill('mi intento')
})
