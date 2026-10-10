import { test, expect } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

// La guía exige una copia ejecutable sin servidor: dist/index.html debe abrir por file://
test('dist abre por file:// sin servidor', async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href)
  await expect(page.getByRole('heading', { name: /métodos numéricos/i })).toBeVisible()
})

test('el portal lista 5 módulos y la navegación por teclado llega al contenido', async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href)
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(5)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /saltar al contenido/i })).toBeFocused()
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href + '#/m1')
  await expect(page.getByRole('link', { name: /volver al portal/i })).toBeVisible()
})
