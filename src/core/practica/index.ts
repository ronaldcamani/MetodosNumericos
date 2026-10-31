import type { CatalogoTema } from './base'
import { DIFERENCIALES } from './diferenciales'
import { ECUACIONES } from './ecuaciones'
import { ERRORES } from './errores'
import { INTEGRACION } from './integracion'
import { INTERPOLACION } from './interpolacion'
import { SISTEMAS } from './sistemas'

export * from './base'

/** Catálogo de generadores por tema (clave = id del registro de temas). */
export const CATALOGOS: Record<string, CatalogoTema> = {
  errores: ERRORES,
  ecuaciones: ECUACIONES,
  sistemas: SISTEMAS,
  interpolacion: INTERPOLACION,
  integracion: INTEGRACION,
  diferenciales: DIFERENCIALES,
}
