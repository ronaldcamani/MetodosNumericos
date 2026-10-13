import Matematica from '../../components/Matematica'
import type { Ejercicio } from '../../components/Ejercicios'
import type { Pregunta } from '../../core/autoevaluacion'

const M = Matematica

export const EJERCICIOS_M1: Ejercicio[] = [
  {
    id: 'm1-e1', nivel: 'Intermedio', titulo: 'Iteraciones necesarias en bisección',
    enunciado: <p>Para <M tex="f(x)=x^3-x-2" /> en <M tex="[1,2]" />, ¿cuántas iteraciones de bisección garantizan una cota de error <M tex="\le 10^{-3}" />? Después, ¿cuál es la cota tras 5 iteraciones?</p>,
    verificar: <>Compruébalo en la calculadora de bisección con tolerancia 0.001.</>,
    solucion: <>
      <p>La cota tras <M tex="n" /> iteraciones es <M tex="(b-a)/2^n" />. Se exige <M tex="1/2^n\le 10^{-3}" />, es decir <M tex="n\ge\log_2 1000\approx 9.97" />, así que <strong>n = 10</strong>.</p>
      <p>Tras 5 iteraciones: <M tex="1/2^5=0.03125" />.</p>
    </>,
  },
  {
    id: 'm1-e2', nivel: 'Intermedio', titulo: 'Newton a mano para √2',
    enunciado: <p>Aplica Newton a <M tex="f(x)=x^2-2" /> con <M tex="x_0=1" /> y calcula <M tex="x_1,x_2,x_3" />. ¿Cuántas cifras correctas gana cada paso aproximadamente?</p>,
    solucion: <>
      <p><M tex="x_{n+1}=x_n-\frac{x_n^2-2}{2x_n}=\frac{x_n}{2}+\frac{1}{x_n}" />.</p>
      <p><M tex="x_1=1.5,\; x_2=1.4166667,\; x_3=1.4142157" /> (y <M tex="x_4=1.4142136" />, ya igual a <M tex="\sqrt2" /> en 8 cifras).</p>
      <p>Los errores son aproximadamente <M tex="0.086,\;0.0025,\;2\times10^{-6}" />: el número de cifras correctas casi se duplica en cada paso, la señal de la convergencia cuadrática.</p>
    </>,
  },
  {
    id: 'm1-e3', nivel: 'Avanzado', titulo: 'Newton que no converge: un ciclo',
    enunciado: <p>Para <M tex="f(x)=x^3-2x+2" /> aplica Newton desde <M tex="x_0=0" /> durante tres pasos. ¿Qué observas y por qué el criterio <M tex="|x_{n+1}-x_n|\le\text{tol}" /> nunca se cumple?</p>,
    solucion: <>
      <p><M tex="f'(x)=3x^2-2" />. <M tex="x_1=0-\frac{2}{-2}=1" />, <M tex="x_2=1-\frac{1}{1}=0" />, <M tex="x_3=1" />…</p>
      <p>Las iteraciones <strong>alternan 0 ↔ 1</strong> (ciclo de periodo 2). El cambio es siempre 1, así que nunca baja de la tolerancia y el programa agota el máximo de iteraciones, que se informa como «sin convergencia», no como éxito. Remedio: otro <M tex="x_0" /> o bisección en un intervalo con cambio de signo (la raíz real está cerca de <M tex="-1.77" />).</p>
    </>,
  },
  {
    id: 'm1-e4', nivel: 'Avanzado', titulo: 'Mal punto inicial y comparación de métodos',
    enunciado: <p>Con <M tex="f(x)=x^3-x-2" /> aplica Newton desde <M tex="x_0=0" /> (cuatro pasos) y compáralo con partir de <M tex="x_0=1.5" />. Concluye cuál método elegirías si no conoces un buen <M tex="x_0" />.</p>,
    verificar: <>Prueba con la calculadora de Newton: x₀ = 0 y x₀ = 1.5.</>,
    solucion: <>
      <p>Desde <M tex="x_0=0" />: <M tex="x_1=-2,\; x_2=-1.2727,\; x_3=-0.5501,\; x_4=-18.10" />. La derivada <M tex="f'(x)=3x^2-1" /> es negativa en 0 y casi se anula cerca de <M tex="x=\pm0.577" />, lo que lanza la iteración lejos de la raíz (que está en 1.5214). Con tolerancia 10⁻⁶ necesita <strong>31 iteraciones</strong> en total.</p>
      <p>Desde <M tex="x_0=1.5" /> converge en <strong>3 iteraciones</strong>.</p>
      <p><strong>Conclusión:</strong> sin un buen <M tex="x_0" /> conviene la bisección en un intervalo con cambio de signo (garantizada, lenta) y, si se quiere velocidad, usar unas iteraciones de bisección para obtener un <M tex="x_0" /> cercano y refinar con Newton.</p>
    </>,
  },
]

export const PREGUNTAS_M1: Pregunta[] = [
  { id: 'm1-q1', tipo: 'opcion', enunciado: '¿Qué condición debe cumplir el intervalo [a, b] para poder aplicar bisección?',
    opciones: ['f(a)·f(b) > 0', 'f(a)·f(b) < 0 con f continua', 'f′(a) ≠ 0', 'b − a < 1'], correcta: 1,
    explicacion: 'El cambio de signo con f continua garantiza una raíz (teorema del valor intermedio).' },
  { id: 'm1-q2', tipo: 'vf', enunciado: 'Si |f(xₙ)| es muy pequeño, entonces xₙ está necesariamente muy cerca de la raíz.', correcta: false,
    explicacion: 'Depende de la pendiente: con f muy plana, un residuo pequeño puede convivir con un error grande en x.' },
  { id: 'm1-q3', tipo: 'numerica', enunciado: 'Número de iteraciones de bisección en [1, 2] para garantizar cota ≤ 10⁻⁶ (entero).', correcta: 20, tolerancia: 0,
    explicacion: 'n ≥ log₂(10⁶) ≈ 19.93, luego n = 20.' },
  { id: 'm1-q4', tipo: 'opcion', enunciado: '¿Cuál de estas situaciones hace fallar a Newton de forma directa?',
    opciones: ['f′(xₙ) = 0', 'f(xₙ) < 0', 'x₀ negativo siempre', 'tolerancia demasiado grande'], correcta: 0,
    explicacion: 'Se divide entre f′(xₙ); el programa lo informa como derivada nula.' },
  { id: 'm1-q5', tipo: 'numerica', enunciado: 'Newton para f(x) = x² − 9 con x₀ = 6: calcula x₁.', correcta: 3.75, tolerancia: 0.001,
    explicacion: 'x₁ = 6 − 27/12 = 3.75.' },
  { id: 'm1-q6', tipo: 'vf', enunciado: 'Newton converge más rápido que bisección para cualquier valor inicial x₀.', correcta: false,
    explicacion: 'Es rápido solo cerca de una raíz simple; con mal x₀ puede divergir, ciclar o saltar a otra raíz.' },
]
