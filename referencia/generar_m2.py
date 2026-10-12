"""Referencia independiente del módulo 2: numpy.linalg.solve y Gauss-Seidel escrito aparte.

Escribe src/core/m2/referencia.json.
"""
import json
from pathlib import Path

import numpy as np

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "m2" / "referencia.json"

CASOS = {
    "base": ([[4, 1, 1], [1, 5, 1], [1, 1, 6]], [9, 14, 21]),
    "2x2": ([[3, 1], [1, 2]], [5, 5]),
    "3x3_pivoteo": ([[0.001, 2, 1], [3, 1, 1], [1, 1, 5]], [4, 5, 7]),
    "3x3_dominante": ([[10, 2, 1], [1, 8, 2], [2, 1, 9]], [13, 11, 12]),
}


def gauss_seidel(A, b, tol=1e-6, max_iter=100, x0=None):
    """Parada: ||b - Ax||_inf <= tol. Devuelve (x, iteraciones, primera_iteracion)."""
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    x = np.zeros(len(b)) if x0 is None else np.array(x0, dtype=float)
    primera = None
    for it in range(1, max_iter + 1):
        for i in range(len(b)):
            x[i] = (b[i] - A[i, :i] @ x[:i] - A[i, i + 1:] @ x[i + 1:]) / A[i, i]
        if it == 1:
            primera = x.copy().tolist()
        if np.max(np.abs(b - A @ x)) <= tol:
            return x, it, primera
    return x, None, primera


EJ1 = ([[-0.04, 0.04, 0.12], [0.56, -1.56, 0.32], [-0.24, 1.24, -0.28]], [3, 1, 0])
EJ2 = ([[1, -1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 2], [2, 0, 0, -3]], [-6, 3, 4, 5])
EJ3 = ([[0.4, 1.1, 3.1], [4, 0.15, 0.25], [2, 5.6, 3.1]], [7.5, 4.45, 0.1])


def dominante(A):
    A = np.abs(np.array(A, float))
    return bool(np.all(2 * np.diag(A) > A.sum(axis=1)))


def permutacion_dominante(A):
    """Primera permutación de filas (orden lexicográfico) con dominancia diagonal estricta."""
    from itertools import permutations
    for p in permutations(range(len(A))):
        if dominante([A[i] for i in p]):
            return list(p)
    return None


def generar_ejercicios():
    out = {}
    for nombre, (A, b) in {"ejercicio1": EJ1, "ejercicio2": EJ2}.items():
        out[nombre] = {"A": A, "b": b, "solucion": np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()}
    A, b = EJ3
    p = permutacion_dominante(A)
    Ar, br = [A[i] for i in p], [b[i] for i in p]
    x, it, primera = gauss_seidel(Ar, br, tol=1e-4, x0=[1, 1, 1])
    out["ejercicio3"] = {
        "A": A, "b": b, "x0": [1, 1, 1], "tol": 1e-4,
        "dominante_original": dominante(A),
        "permutacion": p,
        "solucion": np.linalg.solve(np.array(A, float), np.array(b, float)).tolist(),
        "gs_iteraciones": it, "gs_x": x.tolist(), "gs_primera": primera,
    }
    return out


def generar():
    casos = {}
    for nombre, (A, b) in CASOS.items():
        sol = np.linalg.solve(np.array(A, float), np.array(b, float))
        entrada = {"A": A, "b": b, "solucion": sol.tolist()}
        if nombre != "3x3_pivoteo":  # sin dominancia diagonal: no se asume convergencia
            x, it, primera = gauss_seidel(A, b)
            entrada.update({"gs_iteraciones": it, "gs_x": x.tolist(), "gs_primera": primera})
        casos[nombre] = entrada
    return {"casos": casos, "ejercicios": generar_ejercicios(), "singular": {"A": [[1, 2], [2, 4]], "b": [3, 6], "rango": int(np.linalg.matrix_rank(np.array([[1, 2], [2, 4]], float)))}}


if __name__ == "__main__":
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
