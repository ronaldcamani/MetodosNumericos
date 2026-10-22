import json
import unittest

import numpy as np

import generar_m3 as g


class ValoresDeLaGuia(unittest.TestCase):
    def setUp(self):
        self.base = g.generar()["casos"]["base"]

    def test_lagrange_cuatro_nodos(self):
        self.assertAlmostEqual(self.base["lagrange"]["valor"], 1.9375, places=12)

    def test_bases_suman_uno(self):
        self.assertAlmostEqual(sum(self.base["lagrange"]["bases"]), 1.0, places=12)
        np.testing.assert_allclose(self.base["lagrange"]["bases"], [-0.0625, 0.5625, 0.5625, -0.0625], atol=1e-12)

    def test_recta_ajustada(self):
        r = self.base["regresion"]
        self.assertAlmostEqual(r["pendiente"], 0.9, places=12)
        self.assertAlmostEqual(r["intercepto"], 0.9, places=12)
        self.assertAlmostEqual(r["prediccion"], 2.25, places=12)
        self.assertAlmostEqual(r["sse"], 0.70, places=12)

    def test_residuos_suman_cero(self):
        self.assertAlmostEqual(sum(self.base["regresion"]["residuos"]), 0.0, places=12)

    def test_dos_nodos_coinciden_con_la_recta(self):
        c = g.generar()["casos"]["dos_nodos"]
        self.assertAlmostEqual(c["lagrange"]["valor"], c["regresion"]["prediccion"], places=12)
        self.assertAlmostEqual(c["regresion"]["sse"], 0.0, places=12)

    def test_runge_oscila(self):
        c = g.generar()["casos"]["runge"]
        self.assertLess(c["lagrange"]["valor"], 0)  # el verdadero 1/(1+25·0.8²) ≈ 0.0588 es positivo

    def test_fallos(self):
        f = g.generar()["fallos"]
        self.assertLess(f["abscisa_repetida"]["rango_vandermonde"], f["abscisa_repetida"]["n"])
        self.assertEqual(f["x_iguales"]["sxx"], 0.0)

    def test_json_actualizado(self):
        self.assertEqual(json.loads(g.SALIDA.read_text()), json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_m3.py")


if __name__ == "__main__":
    unittest.main()
