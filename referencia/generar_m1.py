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


def f_base(x: float) -> float:
    return x**3 - x - 2


def falsa_posicion(f, a: float, b: float, tol: float, max_iter: int = 100):
    """Regula falsi con parada |c_n - c_(n-1)| <= tol. Devuelve (raiz, iteraciones, primer_c exacto como Fraction si es posible)."""
    fa, fb = f(a), f(b)
    previo = None
    for n in range(1, max_iter + 1):
        c = (a * fb - b * fa) / (fb - fa)
        fc = f(c)
        if fc == 0 or (previo is not None and abs(c - previo) <= tol):
            return c, n
        previo = c
        if fa * fc < 0:
            b, fb = c, fc
        else:
            a, fa = c, fc
    return None, max_iter


def secante(f, x0: float, x1: float, tol: float, max_iter: int = 100):
    f0, f1 = f(x0), f(x1)
    for n in range(1, max_iter + 1):
        x2 = x1 - f1 * (x1 - x0) / (f1 - f0)
        if abs(x2 - x1) <= tol:
            return x2, n
        x0, f0, x1, f1 = x1, f1, x2, f(x2)
    return None, max_iter


POLINOMIOS = {
    "calibracion": [1, 0, -1, -2],
    "tres_reales": [1, -6, 11, -6],
    "cuarto_grado": [1, 0, -10, 0, 9],
    "doble": [1, -4, 5, -2],
    "sin_reales": [1, 0, 0, 0, 4],
    "grado_dos": [2, -3, -5],
    "lineal": [3, -6],
}


def ordenar(raices):
    return sorted(([float(r.real), float(r.imag)] for r in raices), key=lambda z: (round(z[0], 6), round(z[1], 6)))


def generar_nuevos() -> dict:
    fp_raiz, fp_it = falsa_posicion(f_base, 1.0, 2.0, 1e-6)
    sec_raiz, sec_it = secante(f_base, 1.0, 2.0, 1e-6)
    # primer corte de la secante entre (1, f(1) = -2) y (2, f(2) = 4), con fracciones exactas
    a, b, fa, fb = Fraction(1), Fraction(2), Fraction(-2), Fraction(4)
    c1 = (a * fb - b * fa) / (fb - fa)
    polis = {}
    for nombre, coef in POLINOMIOS.items():
        polis[nombre] = {
            "coef": coef,
            "raices": ordenar(np.roots(coef)),
            "valor_en_2": float(np.polyval(coef, 2.0)),
            "derivada_en_2": float(np.polyval(np.polyder(coef), 2.0)) if len(coef) > 1 else 0.0,
        }
    return {
        "falsa_posicion": {"raiz": fp_raiz, "iteraciones": fp_it, "primer_c": float(c1), "primer_c_fraccion": str(c1), "raiz_scipy": optimize.brentq(f_base, 1.0, 2.0, xtol=1e-14)},
        "secante": {"raiz": sec_raiz, "iteraciones": sec_it},
        "polinomios": polis,
    }


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
        **generar_nuevos(),
    }


if __name__ == "__main__":
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
