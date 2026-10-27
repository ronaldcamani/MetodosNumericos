import json
import unittest

import generar_m5 as g


class ValoresDeLaGuia(unittest.TestCase):
    def setUp(self):
        self.d = g.generar()

    def test_euler_primer_paso(self):
        self.assertAlmostEqual(self.d["casos"]["h0_5"]["euler"][1], 65.0, places=12)

    def test_rk4_primer_paso(self):
        self.assertAlmostEqual(self.d["casos"]["h0_5"]["rk4"][1], 66.728515625, places=12)

    def test_valores_intermedios_rk4(self):
        k = self.d["casos"]["h0_5"]["k_primer_paso"]
        for a, b in zip(k, [-30, -26.25, -26.71875, -23.3203125]):
            self.assertAlmostEqual(a, b, places=12)

    def test_exacta_y_scipy(self):
        self.assertAlmostEqual(self.d["exacta_t0_5"], 66.7280469843, places=9)
        self.assertAlmostEqual(self.d["exacta_t2"], self.d["exacta_t2_scipy"], places=8)

    def test_ultimo_paso_corto(self):
        t = self.d["casos"]["no_divide"]["t"]
        self.assertAlmostEqual(t[-1] - t[-2], 0.2, places=9)
        self.assertEqual(len(t), 8)

    def test_euler_inestable_con_h5(self):
        T = self.d["casos"]["h5"]["euler"]
        self.assertEqual(T[:3], [80.0, -70.0, 155.0])

    def test_estabilidad(self):
        self.assertAlmostEqual(self.d["estabilidad"]["limite_euler_h"], 4.0)
        self.assertAlmostEqual(self.d["estabilidad"]["limite_rk4_kh"], 2.7852935634, places=8)

    def test_orden_de_los_metodos(self):
        r = self.d["razon_errores"]
        self.assertAlmostEqual(r["euler"], 2.12, delta=0.05)
        self.assertGreater(r["rk4"], 15)

    def test_json_actualizado(self):
        self.assertEqual(json.loads(g.SALIDA.read_text()), json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_m5.py")


if __name__ == "__main__":
    unittest.main()
