"""Referencia independiente del tema de ecuaciones diferenciales (Euler y RK4).

Euler y RK4 se escriben aparte del motor TypeScript, y la solución exacta se contrasta con scipy.integrate.solve_ivp (DOP853,
tolerancias muy estrictas). Escribe src/core/m5/referencia.json.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.integrate import solve_ivp

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "m5" / "referencia.json"
T0, TA, K = 80.0, 20.0, 0.5


def f(T, ta=TA, k=K):
    return -k * (T - ta)


def exacta(t, t0=T0, ta=TA, k=K):
    return ta + (t0 - ta) * math.exp(-k * t)


def nodos(h, tf):
    """Tiempos de la malla; si h no divide tf, el último paso es más corto."""
    n = math.ceil(tf / h - 1e-9)
    return [min(i * h, tf) for i in range(n + 1)]


def euler(h, tf, t0=T0, ta=TA, k=K):
    ts = nodos(h, tf)
    T = [t0]
    for a, b in zip(ts, ts[1:]):
        T.append(T[-1] + (b - a) * f(T[-1], ta, k))
    return ts, T


def rk4(h, tf, t0=T0, ta=TA, k=K):
    ts = nodos(h, tf)
    T = [t0]
    ks = []
    for a, b in zip(ts, ts[1:]):
        hh = b - a
        y = T[-1]
        k1 = f(y, ta, k)
        k2 = f(y + hh / 2 * k1, ta, k)
        k3 = f(y + hh / 2 * k2, ta, k)
        k4 = f(y + hh * k3, ta, k)
        ks.append([k1, k2, k3, k4])
        T.append(y + hh / 6 * (k1 + 2 * k2 + 2 * k3 + k4))
    return ts, T, ks


def error_max(ts, T):
    return max(abs(y - exacta(t)) for t, y in zip(ts, T))


def caso(h, tf):
    te, Te = euler(h, tf)
    tr, Tr, ks = rk4(h, tf)
    return {
        "h": h, "tf": tf, "t": te, "euler": Te, "rk4": Tr, "k_primer_paso": ks[0],
        "error_max_euler": error_max(te, Te), "error_max_rk4": error_max(tr, Tr),
    }


def estabilidad():
    z = lambda x: 1 - x + x**2 / 2 - x**3 / 6 + x**4 / 24
    lo, hi = 2.0, 3.0
    for _ in range(80):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if abs(z(m)) < 1 else (lo, m)
    return {
        "factores": [{"h": h, "euler": 1 - K * h, "rk4": z(K * h)} for h in (0.5, 1, 2, 3, 4, 5)],
        "limite_rk4_kh": lo,
        "limite_euler_h": 2 / K,
    }


def exacta_scipy(tf):
    sol = solve_ivp(lambda t, y: [f(y[0])], (0, tf), [T0], method="DOP853", rtol=1e-12, atol=1e-12, t_eval=[tf])
    return float(sol.y[0][0])


def generar():
    return {
        "casos": {"h0_5": caso(0.5, 2), "h0_25": caso(0.25, 2), "no_divide": caso(0.3, 2), "h5": caso(5, 20)},
        "exacta_t2": exacta(2),
        "exacta_t2_scipy": exacta_scipy(2),
        "exacta_t0_5": exacta(0.5),
        "estabilidad": estabilidad(),
        "razon_errores": {
            "euler": error_max(*euler(0.5, 2)) / error_max(*euler(0.25, 2)),
            "rk4": error_max(*rk4(0.5, 2)[:2]) / error_max(*rk4(0.25, 2)[:2]),
        },
    }


if __name__ == "__main__":
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
