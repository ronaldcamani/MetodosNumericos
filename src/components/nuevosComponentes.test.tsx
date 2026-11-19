import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PREGUNTAS_ERRORES } from '../modules/errores/practica'
import { CASO_SISTEMA, EditorSistema } from '../modules/m2/sistema'
import { CASO_DATOS, EditorDatos } from '../modules/m3/datos'
import Autoevaluacion from './Autoevaluacion'
import CaritaEstado, { BarraComprension } from './CaritaEstado'
import ErrorBoundary from './ErrorBoundary'
import TutorPasoAPaso from './TutorPasoAPaso'

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('atrapa errores de renderizado y permite reintentar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const u = userEvent.setup()
    const estado = { explotar: true }
    function BombaDinamica() {
      if (estado.explotar) throw new Error('Fallo simulado de render')
      return <p>Vista recuperada</p>
    }
    render(
      <ErrorBoundary titulo="Fallo controlado">
        <BombaDinamica />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Fallo controlado')
    expect(screen.getByText('Fallo simulado de render')).toBeInTheDocument()
    estado.explotar = false
    await u.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(screen.getByText('Vista recuperada')).toBeVisible()
  })
})

describe('Filtro de errores en editores (M2 y M3)', () => {
  it('EditorSistema no muestra alerta de matriz cuando el error pertenece a tol o maxIter', () => {
    render(
      <EditorSistema
        valores={CASO_SISTEMA}
        errores={{ tol: 'Tolerancia inválida', maxIter: 'Entero requerido' } as Record<string, string>}
        set={() => {}}
      />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('EditorSistema sí muestra alerta cuando falla una celda de la matriz', () => {
    render(<EditorSistema valores={CASO_SISTEMA} errores={{ a11: 'Número inválido.' }} set={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/Revisa los coeficientes marcados/)
  })

  it('EditorDatos no muestra alerta de nodos cuando el error pertenece a consulta', () => {
    render(<EditorDatos valores={CASO_DATOS} errores={{ consulta: 'Ingresa un número.' }} set={() => {}} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('EditorDatos sí muestra alerta cuando falla un nodo x o y', () => {
    render(<EditorDatos valores={CASO_DATOS} errores={{ x2: 'Número inválido.' }} set={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/Revisa los valores marcados/)
  })
})

describe('CaritaEstado y BarraComprension', () => {
  it('renderiza las cinco caritas con etiquetas accesibles y la barra de comprensión', () => {
    render(
      <>
        <CaritaEstado estado="excelente" />
        <CaritaEstado estado="bien" />
        <CaritaEstado estado="analizando" />
        <CaritaEstado estado="aprendiendo" />
        <CaritaEstado estado="trampa" />
        <BarraComprension porcentaje={75} sinGuia={2} conGuia={1} total={4} />
      </>,
    )
    expect(screen.getByRole('img', { name: /Excelente/ })).toHaveTextContent('🤩')
    expect(screen.getAllByRole('img', { name: /¡Bien hecho!/ })[0]).toHaveTextContent('😊')
    expect(screen.getByRole('img', { name: /Analizando/ })).toHaveTextContent('🤔')
    expect(screen.getByRole('img', { name: /Aprendiendo con guía/ })).toHaveTextContent('😅')
    expect(screen.getByRole('img', { name: /trampa/i })).toHaveTextContent('🧐')
    expect(screen.getByRole('meter', { name: /Nivel de comprensión/ })).toHaveAttribute('aria-valuenow', '75')
  })
})

describe('TutorPasoAPaso (solucionario socrático)', () => {
  it('muestra trampa si se equivoca y desbloquea el siguiente sub-paso solo al acertar', async () => {
    const u = userEvent.setup()
    const alCompletar = vi.fn()
    render(
      <TutorPasoAPaso
        alCompletar={alCompletar}
        pasos={[
          {
            regla: 'Regla 1',
            pregunta: 'Pregunta 1',
            opciones: ['Incorrecta', 'Correcta'],
            correcta: 1,
            exito: 'Muy bien paso 1',
            trampa: 'Caíste en la trampa 1',
            revelacion: 'Pista 1 desbloqueada',
          },
          {
            regla: 'Regla 2',
            pregunta: 'Pregunta 2',
            opciones: ['Final OK', 'Final Mal'],
            correcta: 0,
            exito: 'Muy bien paso 2',
            trampa: 'Trampa 2',
            revelacion: 'Conclusión desbloqueada',
          },
        ]}
      />,
    )

    await u.click(screen.getByRole('button', { name: 'Incorrecta' }))
    expect(screen.getByText('Caíste en la trampa 1')).toBeVisible()
    expect(screen.queryByRole('button', { name: /Siguiente paso de la guía/ })).toBeNull()

    await u.click(screen.getByRole('button', { name: 'Correcta' }))
    expect(screen.getByText('Pista 1 desbloqueada')).toBeVisible()
    await u.click(screen.getByRole('button', { name: /Siguiente paso de la guía/ }))

    expect(screen.getByText('Pregunta 2')).toBeVisible()
    await u.click(screen.getByRole('button', { name: 'Final OK' }))
    expect(alCompletar).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Conclusión desbloqueada')).toBeVisible()
  })
})

describe('Autoevaluación guiada multi-paso y variaciones dinámicas', () => {
  it('cambia al modo dinámico de 3 pasos encadenados y regenera variaciones', async () => {
    const u = userEvent.setup()
    render(<Autoevaluacion preguntas={PREGUNTAS_ERRORES} tema="errores" />)

    await u.click(screen.getByRole('button', { name: /Generar nueva variación de ejercicios/ }))
    expect(screen.getByText(/Modo Guiado Multi-Paso/)).toBeVisible()
    const tarjetas = screen.getAllByRole('article')
    expect(tarjetas).toHaveLength(3)

    // Pasos 2 y 3 inician bloqueados hasta resolver el Paso 1
    expect(within(tarjetas[0]).getAllByText(/Completa el paso anterior/)).toHaveLength(2)
    await u.click(within(tarjetas[0]).getByRole('button', { name: /Ver guía paso a paso/ }))
    expect(within(tarjetas[0]).getByLabelText(/Solucionario guiado/)).toBeVisible()

    // Volver a generar cambia el contenido
    const textoAntes = tarjetas.map((t) => t.textContent).join()
    await u.click(screen.getByRole('button', { name: /Generar nueva variación de ejercicios/ }))
    const textoDespues = screen.getAllByRole('article').map((t) => t.textContent).join()
    expect(textoDespues).not.toBe(textoAntes)
  })
})
