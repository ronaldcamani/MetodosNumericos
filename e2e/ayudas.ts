import { expect, type Page } from '@playwright/test'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

export const base = pathToFileURL(path.resolve('dist/index.html')).href

/** Abre el panel lateral (si está cerrado), elige la herramienta del selector (si hay varias) y devuelve su región. */
export async function calculadora(page: Page, nombre: string, herramienta?: string) {
  const abrir = page.getByRole('button', { name: 'Abrir calculadora', expanded: false })
  if (await abrir.count()) await abrir.click()
  const selector = page.getByLabel('Herramienta')
  if (herramienta && (await selector.count())) await selector.selectOption(herramienta)
  const region = page.getByRole('region', { name: nombre })
  await expect(region).toBeVisible()
  return region
}
