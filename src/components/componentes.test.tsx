import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import Calculadora from './Calculadora'
import Campo from './Campo'
import MensajeEstado from './MensajeEstado'
import TablaPasos from './TablaPasos'

vi.mock('./Grafico', () => ({ default: ({ titulo }: { titulo: string }) => <figure aria-label={titulo} /> }))

const irA = (ruta: string) => render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)

describe('portal', () => {
  it('lista los 5 módulos', () => {
    irA('/')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5)
    expect(screen.getAllByText('Próximamente')).toHaveLength(3)
    expect(screen.getAllByRole('link', { name: 'Abrir módulo' }).map((a) => a.getAttribute('href'))).toEqual(['/m1', '/m2'])
  })
  it('fuera del inicio hay enlace de retorno al portal', () => {
    irA('/m1')
    expect(screen.getByRole('link', { name: /volver al portal/i })).toHaveAttribute('href', '/')
  })
  it('ofrece salto al contenido para teclado', () => {
    irA('/')
    expect(screen.getByRole('link', { name: /saltar al contenido/i })).toHaveAttribute('href', '#contenido')
  })
})

describe('MensajeEstado', () => {
  it('éxito usa role status y texto', () => {
    render(<MensajeEstado estado="convergio" mensaje="listo" />)
    expect(screen.getByRole('status')).toHaveTextContent('Correcto')
  })
  it('max_iter usa role alert y no dice correcto', () => {
    render(<MensajeEstado estado="max_iter" mensaje="agotado" />)
    const a = screen.getByRole('alert')
    expect(a).toHaveTextContent('Sin convergencia')
    expect(a).not.toHaveTextContent('Correcto')
  })
})

describe('Campo', () => {
  it('asocia etiqueta, error y marca aria-invalid', () => {
    render(<Campo etiqueta="Tolerancia" valor="x" onChange={() => {}} error="No es un número" />)
    const input = screen.getByLabelText('Tolerancia')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/no es un número/i)
  })
})

describe('TablaPasos', () => {
  it('renderiza columnas y filas', () => {
    render(<TablaPasos titulo="Iteraciones" columnas={[{ clave: 'n', titulo: 'n', valor: (p: { n: number }) => p.n }]} pasos={[{ n: 1 }, { n: 2 }]} />)
    expect(screen.getByRole('table', { name: 'Iteraciones' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })
})

describe('Calculadora', () => {
  it('Calcular, Cargar caso base y Restablecer invocan sus callbacks', async () => {
    const u = userEvent.setup()
    const calc = vi.fn(), caso = vi.fn(), reset = vi.fn()
    render(<Calculadora titulo="Prueba" onCalcular={calc} onCargarCaso={caso} onRestablecer={reset}><span /></Calculadora>)
    await u.click(screen.getByRole('button', { name: 'Calcular' }))
    await u.click(screen.getByRole('button', { name: /caso base/i }))
    await u.click(screen.getByRole('button', { name: /restablecer/i }))
    expect([calc, caso, reset].map((f) => f.mock.calls.length)).toEqual([1, 1, 1])
  })
})
