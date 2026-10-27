"""Referencia independiente del módulo de errores: aritmética decimal exacta (decimal) y math.

Redondeo «mitad hacia arriba» (ROUND_HALF_UP) y truncamiento (ROUND_DOWN) a t cifras significativas.
Escribe src/core/errores/referencia.json.
"""
import json
import math
from decimal import ROUND_DOWN, ROUND_HALF_UP, Context, Decimal
from pathlib import Path

SALIDA = Path(__file__).resolve().parent.parent / "src" / "core" / "errores" / "referencia.json"
MODOS = {"redondeo": ROUND_HALF_UP, "truncamiento": ROUND_DOWN}


def cifras(x: float, t: int, modo: str) -> float:
    if x == 0:
        return 0.0
    return float(Context(prec=t, rounding=MODOS[modo]).create_decimal(Decimal(repr(x))))


def operar(a: float, op: str, b: float, t: int, modo: str) -> dict:
    """Operandos a t cifras; la operación se hace en decimal exacto (50 dígitos) y solo el resultado se redondea."""
    ar, br = cifras(a, t, modo), cifras(b, t, modo)
    da, db = Decimal(repr(ar)), Decimal(repr(br))
    exacto_dec = {"+": da + db, "−": da - db, "×": da * db, "÷": da / db}[op]
    calculado = float(Context(prec=t, rounding=MODOS[modo]).create_decimal(exacto_dec))
    exacto = float({"+": Decimal(repr(a)) + Decimal(repr(b)), "−": Decimal(repr(a)) - Decimal(repr(b)), "×": Decimal(repr(a)) * Decimal(repr(b)), "÷": Decimal(repr(a)) / Decimal(repr(b))}[op])
    return {"aRed": ar, "bRed": br, "calculado": calculado, "exacto": exacto}


def suma(valores: list, t: int, modo: str) -> dict:
    def secuencia(v):
        s = 0.0
        for x in v:
            s = float(Context(prec=t, rounding=MODOS[modo]).create_decimal(Decimal(repr(s)) + Decimal(repr(cifras(x, t, modo)))))
        return s

    return {
        "orden": secuencia(valores),
        "creciente": secuencia(sorted(valores, key=abs)),
        "exacta": float(sum(Decimal(repr(v)) for v in valores)),
    }


def cifras_correctas(verdadero: float, aprox: float):
    e = abs(verdadero - aprox)
    if verdadero == 0:
        return None
    if e == 0:
        return "inf"
    m = math.floor(math.log10(abs(verdadero)))
    n = 0
    # mayor n con e < 0.5 * 10^(m - n + 1)
    while e < 0.5 * 10 ** (m - (n + 1) + 1):
        n += 1
    return n


REDONDEOS = [
    [1.005, 3, "redondeo"], [0.125, 2, "redondeo"], [2.5, 1, "redondeo"], [2.5, 1, "truncamiento"],
    [-2.5, 1, "redondeo"], [1234.5678, 6, "redondeo"], [1234.5678, 6, "truncamiento"],
    [0.000123456, 3, "redondeo"], [9.99, 2, "redondeo"], [9.99, 2, "truncamiento"], [0.3, 1, "truncamiento"],
    [123456, 3, "redondeo"], [3.14159265, 4, "redondeo"],
]
OPERACIONES = [
    [0.12345, "−", 0.12341, 4, "redondeo"],
    [0.12345, "−", 0.12341, 4, "truncamiento"],
    [1.5, "+", 2.25, 3, "redondeo"],
    [3.14159, "×", 2.71828, 4, "redondeo"],
    [1, "÷", 3, 4, "truncamiento"],
    [22, "÷", 7, 5, "redondeo"],
]
SUMAS = [
    [[1000, 0.4, 0.4], 4, "redondeo"],
    [[0.4, 0.4, 1000], 4, "redondeo"],
    [[1, 0.0004, 0.0004, 0.0004], 4, "truncamiento"],
]
APROX = [
    [math.pi, 3.1416], [math.pi, 22 / 7], [math.pi, 3.14], [100.0, 99.5], [0.001234, 0.001], [1.0, 1.0],
]


def generar() -> dict:
    return {
        "redondeos": [{"x": x, "t": t, "modo": m, "valor": cifras(x, t, m)} for x, t, m in REDONDEOS],
        "operaciones": [{"a": a, "op": op, "b": b, "t": t, "modo": m, **operar(a, op, b, t, m)} for a, op, b, t, m in OPERACIONES],
        "sumas": [{"valores": v, "t": t, "modo": m, **suma(v, t, m)} for v, t, m in SUMAS],
        "aproximaciones": [{"verdadero": v, "aproximado": a, "absoluto": abs(v - a), "cifras": cifras_correctas(v, a)} for v, a in APROX],
        "serie_exp": {"x": 1.0, "exacto": math.e, "sumas": [sum(1 / math.factorial(k) for k in range(n)) for n in range(1, 11)]},
        "epsilon_maquina": 2.220446049250313e-16,
    }


if __name__ == "__main__":
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(generar(), indent=2) + "\n")
    print(f"escrito {SALIDA}")
