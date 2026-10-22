"""Referencia independiente del módulo 4: numpy.trapezoid / scipy.integrate.simpson e integral exacta con numpy.polyint.

Escribe src/core/m4/referencia.json.
"""
import json
from pathlib import Path

import numpy as np
from scipy.integrate import simpson

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "m4" / "referencia.json"

# (a, b, c, alfa, beta, n): r(t) = a t² + b t + c sobre [alfa, beta]
CASOS = {
    "base_n2": (1, 0, 1, 0, 2, 2),
    "base_n4": (1, 0, 1, 0, 2, 4),
    "base_n8": (1, 0, 1, 0, 2, 8),
    "general": (0.5, -1, 3, 1, 3, 6),
    "ejercicio2": (3, 2, 1, 1, 3, 2),
    "tasa_negativa": (1, -3, 1, 0, 3, 6),
    "n_grande": (1, 0, 1, 0, 2, 116),
}


def exacta(a, b, c, lo, hi):
    P = np.polyint([a, b, c])
    return float(np.polyval(P, hi) - np.polyval(P, lo))


def minimo(a, b, c, lo, hi):
    """Mínimo de la tasa en [lo, hi] por muestreo fino (independiente de la fórmula del vértice)."""
    t = np.linspace(lo, hi, 200001)
    return float(np.min(np.polyval([a, b, c], t)))


def caso(a, b, c, lo, hi, n):
    t = np.linspace(lo, hi, n + 1)
    r = np.polyval([a, b, c], t)
    ex = exacta(a, b, c, lo, hi)
    trap = float(np.trapezoid(r, t))
    simp = float(simpson(r, x=t)) if n % 2 == 0 else None
    return {
        "a": a, "b": b, "c": c, "alfa": lo, "beta": hi, "n": n,
        "exacta": ex, "trapecio": trap, "simpson": simp,
        "min_tasa": minimo(a, b, c, lo, hi),
    }


def generar():
    # Integrando de grado 4 (no cuadrático): ∫0^1 x⁴ dx = 1/5; Simpson NO es exacto.
    quartica = {}
    for n in (2, 4):
        t = np.linspace(0, 1, n + 1)
        quartica[str(n)] = {"trapecio": float(np.trapezoid(t**4, t)), "simpson": float(simpson(t**4, x=t)), "exacta": 0.2}
    return {
        "casos": {k: caso(*v) for k, v in CASOS.items()},
        "cuartica": quartica,
        "derivada_central": {"t": 1, "h": 0.1, "valor": (((1.1) ** 2 + 1) - ((0.9) ** 2 + 1)) / 0.2},
    }


if __name__ == "__main__":
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
