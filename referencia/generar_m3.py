"""Referencia independiente del módulo 3: Vandermonde + numpy.polyfit (no comparte fórmulas con el motor TS).

Lagrange se calcula resolviendo el sistema de Vandermonde (coeficientes del polinomio interpolante);
la regresión, con numpy.polyfit de grado 1. Escribe src/core/m3/referencia.json.
"""
import json
from fractions import Fraction
from pathlib import Path

import numpy as np

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "m3" / "referencia.json"

# Runge con nodos equiespaciados: y = 1/(1+25x²) redondeado a 4 decimales (como lo escribe el usuario).
RUNGE_X = [-1, -0.6, -0.2, 0.2, 0.6, 1]
RUNGE_Y = [round(1 / (1 + 25 * x * x), 4) for x in RUNGE_X]

CASOS = {
    "base": ([0, 1, 2, 3], [1, 2, 2, 4], 1.5),
    "dos_nodos": ([1, 3], [2, 6], 2),
    "seis_nodos": ([0, 1, 2, 3, 4, 5], [1, 2.5, 2, 4, 3.5, 6], 2.5),
    "runge": (RUNGE_X, RUNGE_Y, 0.8),
    "fuera_de_rango": ([0, 1, 2, 3], [1, 2, 2, 4], 5),
    "ejercicio2": ([1, 2, 3, 4], [2, 3, 5, 6], 5),
}


def lagrange(x, y, xq):
    """Polinomio interpolante por Vandermonde. Devuelve (valor, coeficientes de mayor a menor grado)."""
    x = np.array(x, float)
    coef = np.linalg.solve(np.vander(x, len(x)), np.array(y, float))
    return float(np.polyval(coef, xq)), coef.tolist()


def bases(x, xq):
    """L_i(xq) con aritmética exacta (Fraction) para fijar los valores esperados de las bases."""
    xs = [Fraction(v).limit_denominator(10**6) for v in x]
    q = Fraction(xq).limit_denominator(10**6)
    out = []
    for i, xi in enumerate(xs):
        L = Fraction(1)
        for j, xj in enumerate(xs):
            if j != i:
                L *= (q - xj) / (xi - xj)
        out.append(float(L))
    return out


def regresion(x, y, xq):
    x = np.array(x, float)
    y = np.array(y, float)
    b1, b0 = np.polyfit(x, y, 1)
    yhat = b0 + b1 * x
    res = y - yhat
    sse = float(np.sum(res**2))
    sst = float(np.sum((y - y.mean()) ** 2))
    return {
        "pendiente": float(b1), "intercepto": float(b0), "residuos": res.tolist(),
        "sse": sse, "r2": 1 - sse / sst if sst > 0 else None, "prediccion": float(b0 + b1 * xq),
    }


def generar():
    casos = {}
    for nombre, (x, y, xq) in CASOS.items():
        valor, coef = lagrange(x, y, xq)
        casos[nombre] = {
            "x": x, "y": y, "xq": xq,
            "lagrange": {"valor": valor, "bases": bases(x, xq), "coef": coef},
            "regresion": regresion(x, y, xq),
        }
    # Pruebas de fallo de la guía: abscisa repetida (Vandermonde singular) y todas las x iguales (Sxx = 0).
    repetida = np.vander(np.array([0, 1, 1, 3], float), 4)
    iguales = np.array([2, 2, 2, 2], float)
    fallos = {
        "abscisa_repetida": {"rango_vandermonde": int(np.linalg.matrix_rank(repetida)), "n": 4},
        "x_iguales": {"sxx": float(np.sum((iguales - iguales.mean()) ** 2))},
    }
    return {"casos": casos, "fallos": fallos}


if __name__ == "__main__":
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
