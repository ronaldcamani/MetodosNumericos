import json
import unittest

import generar_errores as g


class Valores(unittest.TestCase):
    def test_redondeo_mitad_hacia_arriba(self):
        self.assertEqual(g.cifras(1.005, 3, "redondeo"), 1.01)
        self.assertEqual(g.cifras(2.5, 1, "redondeo"), 3.0)
        self.assertEqual(g.cifras(-2.5, 1, "redondeo"), -3.0)

    def test_truncamiento(self):
        self.assertEqual(g.cifras(2.5, 1, "truncamiento"), 2.0)
        self.assertEqual(g.cifras(9.99, 2, "truncamiento"), 9.9)

    def test_cancelacion_en_la_resta(self):
        o = g.operar(0.12345, "−", 0.12341, 4, "redondeo")
        self.assertAlmostEqual(o["exacto"], 0.00004, places=12)
        self.assertAlmostEqual(o["calculado"], 0.0001, places=12)

    def test_orden_de_la_suma_importa(self):
        s = g.suma([1000, 0.4, 0.4], 4, "redondeo")
        self.assertEqual(s["orden"], 1000.0)
        self.assertEqual(s["creciente"], 1001.0)
        self.assertAlmostEqual(s["exacta"], 1000.8)

    def test_cifras_correctas(self):
        self.assertEqual(g.cifras_correctas(3.141592653589793, 3.1416), 5)
        self.assertEqual(g.cifras_correctas(3.141592653589793, 22 / 7), 3)

    def test_json_actualizado(self):
        self.assertEqual(json.loads(g.SALIDA.read_text()), json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_errores.py")


if __name__ == "__main__":
    unittest.main()
