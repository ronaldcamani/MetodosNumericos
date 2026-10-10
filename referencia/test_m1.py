import json
import math
import unittest
from fractions import Fraction

import generar_m1 as g


class ValoresDeLaGuia(unittest.TestCase):
    def test_raiz_caso_base(self):
        self.assertAlmostEqual(g.raiz_positiva_calibracion(2.0), 1.5213797068, places=9)

    def test_primer_paso_newton(self):
        self.assertEqual(g.newton_exacto_primer_paso(), Fraction(35, 23))
        self.assertAlmostEqual(float(Fraction(35, 23)), 1.5217391304, places=9)

    def test_iteraciones_biseccion(self):
        self.assertEqual(g.iteraciones_biseccion(1, 2, 1e-6), 20)

    def test_numpy_y_scipy_coinciden(self):
        for c in g.generar()["casos"]:
            self.assertAlmostEqual(c["raiz"], c["raiz_scipy"], places=10)

    def test_json_actualizado(self):
        actual = json.loads(g.SALIDA.read_text())
        self.assertEqual(actual, json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_m1.py")


if __name__ == "__main__":
    unittest.main()
