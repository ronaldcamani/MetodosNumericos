"""
Generador offline de video-lecciones explicadas paso a paso con Manim + Edge-TTS
para los 6 módulos de `portal-metodos-numericos`.

Requisitos:
    pip install manim edge-tts

Uso rápido:
    # 1) Pre-generar las pistas de narración en español (.mp3) con edge-tts:
    python referencia/videos_manim.py --generar-audio

    # 2) Renderizar las escenas en MP4 (alta calidad):
    manim -pqh referencia/videos_manim.py LeccionErrores
    manim -pqh referencia/videos_manim.py LeccionEcuacionesNewton
    manim -pqh referencia/videos_manim.py LeccionSistemasGaussSeidel
    manim -pqh referencia/videos_manim.py LeccionInterpolacionLagrangeRegresion
    manim -pqh referencia/videos_manim.py LeccionIntegracionTrapecioSimpson
    manim -pqh referencia/videos_manim.py LeccionEcuacionesDiferencialesEulerRK4
"""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

VOZ_ESPANOL = "es-PE-CamilaNeural"
CARPETA_AUDIO = Path(__file__).resolve().parent / "audios_lecciones"

GUIONES: dict[str, dict[str, str]] = {
    "errores": {
        "escena": "LeccionErrores",
        "titulo": "Errores numéricos y truncamiento",
        "texto": (
            "Al aproximar pi por veintidós séptimos obtenemos tres cifras significativas correctas. "
            "En la serie de Maclaurin de e elevado a x, cortar en cinco términos produce error de truncamiento "
            "acotado por la fórmula de Lagrange. Además, evitar restas de números casi iguales previene "
            "la cancelación catastrófica."
        ),
    },
    "ecuaciones": {
        "escena": "LeccionEcuacionesNewton",
        "titulo": "Ecuaciones no lineales: Newton-Raphson y Secante",
        "texto": (
            "Para resolver x al cubo menos x menos dos igual a cero, Bisección garantiza convergencia "
            "con orden lineal uno en veinte pasos. Newton-Raphson sigue la tangente desde uno punto cinco "
            "y converge en tres pasos con orden cuadrático dos, mientras la Secante alcanza orden "
            "superlineal uno punto seiscientos dieciocho sin derivar."
        ),
    },
    "sistemas": {
        "escena": "LeccionSistemasGaussSeidel",
        "titulo": "Sistemas lineales: Gauss con pivoteo y Gauss-Seidel",
        "texto": (
            "En el sistema tres por tres con matriz diagonalmente dominante, la eliminación gaussiana "
            "con pivoteo parcial controla el redondeo. Gauss-Seidel reutiliza cada incógnita recién "
            "calculada dentro de la misma iteración hasta que el residuo en norma infinito cumple la tolerancia."
        ),
    },
    "interpolacion": {
        "escena": "LeccionInterpolacionLagrangeRegresion",
        "titulo": "Interpolación de Lagrange vs Regresión lineal",
        "texto": (
            "Con datos exactos, el polinomio de Lagrange pasa exactamente por todos los nodos mediante "
            "bases que suman uno. Cuando los datos tienen ruido, la recta de mínimos cuadrados resume "
            "la tendencia sin sobreajustar errores de medición."
        ),
    },
    "integracion": {
        "escena": "LeccionIntegracionTrapecioSimpson",
        "titulo": "Integración y derivación numérica",
        "texto": (
            "El trapecio compuesto divide el área con error proporcional a h al cuadrado, mientras "
            "Simpson un tercio usa parábolas para n par alcanzando orden h a la cuarta. En derivación, "
            "la diferencia central mejora la precisión hasta que h muy pequeño dispara la cancelación."
        ),
    },
    "diferenciales": {
        "escena": "LeccionEcuacionesDiferencialesEulerRK4",
        "titulo": "Ecuaciones diferenciales: Euler, RK4 y estabilidad",
        "texto": (
            "En la ley de enfriamiento de Newton, Euler explícito es de orden uno y se vuelve inestable "
            "cuando el paso h supera dos entre k. Runge-Kutta de orden cuatro promedia cuatro pendientes "
            "logrando errores miles de veces menores."
        ),
    },
}


async def sintetizar_audio_async(modulo: str, voz: str = VOZ_ESPANOL) -> Path:
    """Genera un archivo MP3 con narración en español usando edge-tts."""
    import edge_tts  # type: ignore

    CARPETA_AUDIO.mkdir(parents=True, exist_ok=True)
    salida = CARPETA_AUDIO / f"{modulo}.mp3"
    comunicador = edge_tts.Communicate(GUIONES[modulo]["texto"], voz)
    await comunicador.save(str(salida))
    return salida


async def generar_todos_los_audios(voz: str = VOZ_ESPANOL) -> list[Path]:
    rutas: list[Path] = []
    for mod in GUIONES:
        rutas.append(await sintetizar_audio_async(mod, voz))
    return rutas


try:
    from manim import (  # type: ignore
        Axes,
        BLUE,
        Create,
        DOWN,
        FadeIn,
        FadeOut,
        MathTex,
        ORANGE,
        Scene,
        Text,
        UP,
        VGroup,
        Write,
    )

    MANIM_DISPONIBLE = True
except ImportError:  # Permite importar e inspeccionar el script sin Manim instalado.
    MANIM_DISPONIBLE = False
    Scene = object  # type: ignore


class _LeccionBase(Scene):  # type: ignore[misc]
    modulo_id = ""
    titulo_texto = ""
    formula_principal = ""
    formula_pasos: tuple[str, ...] = ()

    def _adjuntar_audio(self) -> None:
        audio = CARPETA_AUDIO / f"{self.modulo_id}.mp3"
        if audio.exists():
            self.add_sound(str(audio))

    def construct(self) -> None:
        if not MANIM_DISPONIBLE:
            raise RuntimeError("Instala manim para renderizar escenas: pip install manim edge-tts")

        self._adjuntar_audio()
        titulo = Text(self.titulo_texto, font_size=34, color=BLUE).to_edge(UP)
        principal = MathTex(self.formula_principal, font_size=40).shift(UP * 1.1)
        self.play(Write(titulo))
        self.play(FadeIn(principal))

        pasos = VGroup(*[MathTex(tex, font_size=30) for tex in self.formula_pasos]).arrange(DOWN, buff=0.35)
        pasos.next_to(principal, DOWN, buff=0.6)
        for paso in pasos:
            self.play(Write(paso), run_time=1.8)
            self.wait(0.8)

        self.wait(1.5)
        self.play(FadeOut(titulo), FadeOut(principal), FadeOut(pasos))


class LeccionErrores(_LeccionBase):
    modulo_id = "errores"
    titulo_texto = "Errores numéricos: truncamiento y redondeo"
    formula_principal = r"E_{abs}=|x-\tilde x|,\quad e^x \approx \sum_{k=0}^{n-1}\frac{x^k}{k!}"
    formula_pasos = (
        r"\pi\approx \tfrac{22}{7} \Rightarrow E_{rel}\approx 0.04025\,\%",
        r"e^1\approx S_5=2.7083 \Rightarrow E_{trunc}\approx 0.00995 < \frac{e}{5!}",
        r"0.1235-0.1234=0.0001 \quad (\text{cancelación } 150\,\%)",
    )


class LeccionEcuacionesNewton(_LeccionBase):
    modulo_id = "ecuaciones"
    titulo_texto = "Métodos abiertos: Newton (p=2) y Secante (p≈1.62)"
    formula_principal = r"x_{k+1}=x_k-\frac{f(x_k)}{f'(x_k)},\qquad f(x)=x^3-x-2"
    formula_pasos = (
        r"x_0=1.5 \Rightarrow f(1.5)=-0.125,\; f'(1.5)=5.75",
        r"x_1=1.521739,\; x_2=1.521380,\; x_3=1.5213797",
        r"p \approx \frac{\ln(|\Delta x_k|/|\Delta x_{k-1}|)}{\ln(|\Delta x_{k-1}|/|\Delta x_{k-2}|)} \approx 2",
    )

    def construct(self) -> None:
        if not MANIM_DISPONIBLE:
            raise RuntimeError("Instala manim para renderizar escenas: pip install manim edge-tts")
        self._adjuntar_audio()
        ejes = Axes(x_range=[0.5, 2.2, 0.5], y_range=[-3, 5, 2], x_length=6.5, y_length=3.5).to_edge(DOWN)
        curva = ejes.plot(lambda x: x**3 - x - 2, color=BLUE)
        titulo = Text(self.titulo_texto, font_size=30, color=BLUE).to_edge(UP)
        eq = MathTex(self.formula_principal, font_size=34).next_to(titulo, DOWN)
        self.play(Write(titulo), FadeIn(eq))
        self.play(Create(ejes), Create(curva), run_time=2.5)
        for tex in self.formula_pasos:
            nota = MathTex(tex, font_size=26, color=ORANGE).next_to(eq, DOWN)
            self.play(Write(nota), run_time=1.5)
            self.wait(0.8)
            self.play(FadeOut(nota), run_time=0.4)


class LeccionSistemasGaussSeidel(_LeccionBase):
    modulo_id = "sistemas"
    titulo_texto = "Sistemas lineales: Gauss y Gauss-Seidel"
    formula_principal = r"x_i^{(k+1)}=\frac{b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}}{a_{ii}}"
    formula_pasos = (
        r"|a_{ii}| > \sum_{j\neq i}|a_{ij}| \;\text{(dominancia diagonal)}",
        r"x^{(1)}=(2.25,\; 2.35,\; 2.7333) \to (1,2,3)",
        r"\|b-A\tilde x\|_\infty \le \text{tol}",
    )


class LeccionInterpolacionLagrangeRegresion(_LeccionBase):
    modulo_id = "interpolacion"
    titulo_texto = "Interpolación de Lagrange vs Regresión lineal"
    formula_principal = r"P(x)=\sum_{i=0}^{n-1} y_i\,L_i(x) \qquad\text{vs}\qquad \hat y=b_0+b_1 x"
    formula_pasos = (
        r"\sum_{i=0}^{n-1} L_i(x)=1 \;\text{y}\; P_{\text{Lagrange}}(1.5)=1.9375",
        r"b_1=\frac{S_{xy}}{S_{xx}}=0.9,\; b_0=0.9 \Rightarrow \hat y(1.5)=2.25",
        r"SSE=\sum(y_i-\hat y_i)^2=0.70,\quad R^2\approx 0.853",
    )


class LeccionIntegracionTrapecioSimpson(_LeccionBase):
    modulo_id = "integracion"
    titulo_texto = "Integración y derivación numérica"
    formula_principal = r"\int_0^2(t^2+1)\,dt=\frac{14}{3}\approx 4.6667"
    formula_pasos = (
        r"\text{Trapecio } n=4:\; T_4=4.75\; (E=\tfrac{1}{12},\; O(h^2))",
        r"\text{Simpson } n=4:\; S_4=\tfrac{14}{3}\; (O(h^4),\; n\text{ par})",
        r"\text{Central } f'(t)\approx \frac{f(t+h)-f(t-h)}{2h}\; O(h^2)",
    )


class LeccionEcuacionesDiferencialesEulerRK4(_LeccionBase):
    modulo_id = "diferenciales"
    titulo_texto = "EDO: Euler, RK4 y criterio de estabilidad"
    formula_principal = r"T'=-0.5(T-20),\quad T(0)=80\,^\circ\text{C}"
    formula_pasos = (
        r"\text{Euler } (h=0.5):\; T_1=65\,^\circ\text{C}\; (E=1.728)",
        r"\text{RK4 } (h=0.5):\; T_1=66.7285\,^\circ\text{C}\; (E=4.7\times 10^{-4})",
        r"|1-kh|<1 \;\Longleftrightarrow\; 0<h<\frac{2}{k}=4\text{ min}",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Video-lecciones con Manim y Edge-TTS")
    parser.add_argument("--listar", action="store_true", help="Muestra las 6 escenas disponibles")
    parser.add_argument("--generar-audio", action="store_true", help="Genera pistas MP3 con edge-tts")
    parser.add_argument("--voz", default=VOZ_ESPANOL, help=f"Voz neural de edge-tts (default: {VOZ_ESPANOL})")
    args = parser.parse_args()

    if args.listar:
        for mod, info in GUIONES.items():
            print(f"- {mod:14s} -> {info['escena']} ({info['titulo']})")
        return

    if args.generar_audio:
        rutas = asyncio.run(generar_todos_los_audios(args.voz))
        for r in rutas:
            print(f"Audio generado: {r}")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
