"""Referencia independiente del módulo 1 (no comparte código con el motor TypeScript).

Raíces con numpy.roots, bisección con scipy.optimize.bisect y Newton implementado aparte
con fracciones exactas para el primer paso. Escribe src/core/m1/referencia.json.
"""
import json
import math
from fractions import Fraction
from pathlib import Path

import numpy as np
from scipy import optimize

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "m1" / "referencia.json"


def raiz_positiva_calibracion(objetivo: float) -> float:
    """Raíz real mayor de x^3 - x - objetivo = 0."""
    r = np.roots([1, 0, -1, -objetivo])
    return float(max(x.real for x in r if abs(x.imag) < 1e-9))


def raiz_cubo(objetivo: float) -> float:
    return float(np.cbrt(objetivo))


def iteraciones_biseccion(a: float, b: float, tol: float) -> int:
    """Máximo teórico: menor n con (b - a)/2^n <= tol. Puede ser menor si algún punto medio es raíz exacta."""
    return max(1, math.ceil(math.log2((b - a) / tol)))


def newton_exacto_primer_paso() -> Fraction:
    x = Fraction(3, 2)
    return x - (x**3 - x - 2) / (3 * x**2 - 1)


def generar() -> dict:
    casos = []
    for objetivo in (2.0, 0.5, 5.0, 10.0):
        casos.append({
            "modelo": "calibracion",
            "objetivo": objetivo,
            "raiz": raiz_positiva_calibracion(objetivo),
            "intervalo": [0.0, 3.0] if objetivo > 2 else [1.0, 2.0],
        })
    casos.append({"modelo": "cubo", "objetivo": 8.0, "raiz": raiz_cubo(8.0), "intervalo": [1.0, 3.0]})
    for c in casos:
        f = (lambda x, o=c["objetivo"]: x**3 - x - o) if c["modelo"] == "calibracion" else (lambda x, o=c["objetivo"]: x**3 - o)
        a, b = c["intervalo"]
        # bisect como contraste de la raíz (tolerancia mucho menor que la usada en los tests)
        c["raiz_scipy"] = optimize.bisect(f, a, b, xtol=1e-14)
        c["iter_biseccion_tol1e-6"] = iteraciones_biseccion(a, b, 1e-6)
    return {
        "casos": casos,
        "newton_primer_paso": float(newton_exacto_primer_paso()),
        "newton_primer_paso_fraccion": str(newton_exacto_primer_paso()),
    }


if __name__ == "__main__":
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
