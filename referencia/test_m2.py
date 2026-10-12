import json
import unittest

import numpy as np

import generar_m2 as g


class ValoresDeLaGuia(unittest.TestCase):
    def test_solucion_exacta_caso_base(self):
        sol = g.generar()["casos"]["base"]["solucion"]
        np.testing.assert_allclose(sol, [1, 2, 3], atol=1e-12)

    def test_primera_iteracion_gauss_seidel(self):
        primera = g.generar()["casos"]["base"]["gs_primera"]
        np.testing.assert_allclose(primera, [2.25, 2.35, 2.7333333333], atol=1e-9)

    def test_sistema_singular(self):
        self.assertEqual(g.generar()["singular"]["rango"], 1)

    def test_ejercicios_de_practica(self):
        e = g.generar()["ejercicios"]
        np.testing.assert_allclose(e["ejercicio1"]["solucion"], [7, 7, 25], atol=1e-9)
        np.testing.assert_allclose(e["ejercicio2"]["solucion"], [31, 37, -34, 19], atol=1e-9)
        np.testing.assert_allclose(e["ejercicio3"]["solucion"], [1, -2, 3], atol=1e-9)

    def test_ejercicio3_requiere_reordenar(self):
        e = g.generar()["ejercicios"]["ejercicio3"]
        self.assertFalse(e["dominante_original"])
        self.assertEqual(e["permutacion"], [1, 2, 0])

    def test_json_actualizado(self):
        self.assertEqual(json.loads(g.SALIDA.read_text()), json.loads(json.dumps(g.generar())), "ejecuta: python3 referencia/generar_m2.py")


if __name__ == "__main__":
    unittest.main()
