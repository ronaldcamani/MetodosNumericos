import { aCSV } from './csv'
import { parseEntero, parseNumero } from './entrada'
import { fmt } from './formato'
import { esExito } from './tipos'

describe('fmt', () => {
  it('redondea solo al presentar', () => {
    expect(fmt(1.5213797068, 6)).toBe('1.52138')
    expect(fmt(2)).toBe('2')
  })
  it('maneja valores especiales', () => {
    expect(fmt(NaN)).toBe('NaN')
    expect(fmt(Infinity)).toBe('∞')
    expect(fmt(null)).toBe('—')
    expect(fmt(0)).toBe('0')
  })
  it('usa notación científica para magnitudes extremas', () => {
    expect(fmt(1.23e-7, 3)).toBe('1.23e−7')
  })
})

describe('parseNumero', () => {
  it.each([['1.5', 1.5], [' 2,5 ', 2.5], ['-3', -3], ['1e-6', 1e-6], ['.5', 0.5]])('acepta %s', (t, n) => {
    expect(parseNumero(t)).toBe(n)
  })
  it.each(['', 'abc', '1..2', 'Infinity', 'NaN', '1e999', '0x10', '1 2'])('rechaza "%s"', (t) => {
    expect(parseNumero(t)).toBeNull()
  })
  it('parseEntero rechaza decimales', () => {
    expect(parseEntero('4')).toBe(4)
    expect(parseEntero('4.5')).toBeNull()
  })
})

describe('aCSV', () => {
  it('escapa comas, comillas y saltos', () => {
    expect(aCSV(['a', 'b'], [[1, 'x,y'], ['"q"', null]])).toBe('a,b\n1,"x,y"\n"""q""",\n')
  })
})

describe('esExito', () => {
  it('max_iter no es éxito', () => {
    expect(esExito('max_iter')).toBe(false)
    expect(esExito('convergio')).toBe(true)
    expect(esExito('ok')).toBe(true)
    expect(esExito('singular')).toBe(false)
  })
})

describe('fmt signos', () => {
  it('usa el signo menos tipográfico', () => {
    expect(fmt(-0.125, 3)).toBe('−0.125')
    expect(fmt(-1.5e-7, 2)).toBe('−1.5e−7')
  })
})
