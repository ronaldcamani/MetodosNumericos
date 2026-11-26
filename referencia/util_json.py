import math


def assert_json_close(tc, actual, esperado, msg: str = "", rtol: float = 1e-11, atol: float = 1e-12, ruta: str = "$"):
    """Compara estructuras JSON tolerando diferencias de 1–2 ULPs entre plataformas BLAS/NumPy."""
    if isinstance(esperado, dict):
        tc.assertIsInstance(actual, dict, f"{msg} ({ruta})")
        tc.assertEqual(set(actual.keys()), set(esperado.keys()), f"{msg} ({ruta})")
        for k in esperado:
            assert_json_close(tc, actual[k], esperado[k], msg=msg, rtol=rtol, atol=atol, ruta=f"{ruta}.{k}")
    elif isinstance(esperado, list):
        tc.assertIsInstance(actual, list, f"{msg} ({ruta})")
        tc.assertEqual(len(actual), len(esperado), f"{msg} ({ruta})")
        for i, (a, e) in enumerate(zip(actual, esperado)):
            assert_json_close(tc, a, e, msg=msg, rtol=rtol, atol=atol, ruta=f"{ruta}[{i}]")
    elif isinstance(esperado, bool) or esperado is None:
        tc.assertEqual(actual, esperado, f"{msg} ({ruta})")
    elif isinstance(esperado, (int, float)) and isinstance(actual, (int, float)) and not isinstance(actual, bool):
        if math.isnan(esperado) and math.isnan(actual):
            return
        if not math.isclose(float(actual), float(esperado), rel_tol=rtol, abs_tol=atol):
            tc.fail(f"{msg} ({ruta}): {actual!r} != {esperado!r} (rtol={rtol}, atol={atol})")
    else:
        tc.assertEqual(actual, esperado, f"{msg} ({ruta})")
