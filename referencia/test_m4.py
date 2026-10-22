import json
import unittest

import generar_m4 as g


class ValoresDeLaGuia(unittest.TestCase):
    def setUp(self):
        self.c = g.generar()["casos"]

    def test_integral_exacta(self):
        self.assertAlmostEqual(self.c["base_n4"]["exacta"], 14 / 3, places=12)

    def test_trapecio_n4(self):
        self.assertAlmostEqual(self.c["base_n4"]["trapecio"], 4.75, places=12)
        self.assertAlmostEqual(abs(self.c["base_n4"]["trapecio"] - 14 / 3), 1 / 12, places=12)

    def test_simpson_exacto_en_cuadraticas(self):
        for k in ("base_n2", "base_n4", "base_n8", "general", "ejercicio2"):
            self.assertAlmostEqual(self.c[k]["simpson"], self.c[k]["exacta"], places=10)

    def test_error_trapecio_cae_cuatro_veces(self):
        e = [abs(self.c[f"base_n{n}"]["trapecio"] - 14 / 3) for n in (2, 4, 8)]
        self.assertAlmostEqual(e[0] / e[1], 4, places=9)
        self.assertAlmostEqual(e[1] / e[2], 4, places=9)

    def test_ejercicio2(self):
        self.assertAlmostEqual(self.c["ejercicio2"]["exacta"], 36, places=12)
        self.assertAlmostEqual(self.c["ejercicio2"]["trapecio"], 37, places=12)

    def test_tasa_negativa_detectada(self):
        self.assertLess(self.c["tasa_negativa"]["min_tasa"], 0)
        self.assertGreater(self.c["base_n4"]["min_tasa"], 0)

    def test_simpson_no_exacto_en_cuartica(self):
        q = g.generar()["cuartica"]
        self.assertAlmostEqual(q["2"]["simpson"] - 0.2, 1 / 120, places=12)
        self.assertAlmostEqual((q["2"]["simpson"] - 0.2) / (q["4"]["simpson"] - 0.2), 16, places=9)

    def test_derivada_central(self):
        self.assertAlmostEqual(g.generar()["derivada_central"]["valor"], 2.0, places=10)

    def test_json_actualizado(self):
        self.assertEqual(json.loads(g.SALIDA.read_text()), json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_m4.py")


if __name__ == "__main__":
    unittest.main()
