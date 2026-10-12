import { crearFSistema } from './sistema'

/** Ejercicios de práctica del curso. Las soluciones exactas se verifican en los tests con numpy. */
export const EJERCICIO_1 = crearFSistema(
  [[-0.04, 0.04, 0.12], [0.56, -1.56, 0.32], [-0.24, 1.24, -0.28]],
  [3, 1, 0],
) // solución: (7, 7, 25)

/** a, b, c, d se identifican con x1, x2, x3, x4. */
export const EJERCICIO_2 = crearFSistema(
  [[1, -1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 2], [2, 0, 0, -3]],
  [-6, 3, 4, 5],
) // solución: (31, 37, −34, 19)

/** x, y, z son x1, x2, x3. Tal como está escrito no es diagonalmente dominante y Gauss-Seidel diverge. */
export const EJERCICIO_3 = {
  sistema: crearFSistema([[0.4, 1.1, 3.1], [4, 0.15, 0.25], [2, 5.6, 3.1]], [7.5, 4.45, 0.1]),
  x0: [1, 1, 1],
  tol: 0.0001,
} // solución: (1, −2, 3)
