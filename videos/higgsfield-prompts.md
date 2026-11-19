Routing to higgsfield-prompt + higgsfield-camera + higgsfield-vibe-motion + higgsfield-models

# Guión de Prompts Higgsfield AI y Vibe Motion (Portal de Métodos Numéricos)

Conjunto de **6 prompts MCSLA para video generativo** (introducción visual/B-roll HD 16:9) y **6 briefs de Vibe Motion** para superposiciones matemáticas de alta precisión sincronizadas con `VideoLeccion.tsx` y `videos/<modulo>/index.html`.

---

## Reglas aplicadas
- Formato **MCSLA** (Model · Camera · Subject · Look · Action), longitud menor a 200 palabras por prompt, sujeto y acción al inicio.
- Presets de cámara validados (`Dolly In`, `Dolly Right`, `Arc`, `Overhead`, `Robo Arm`) y modelos verificados (`Kling 3.0`, `Seedance 2.0`, `Wan 2.7`, `Vibe Motion`).
- Restricciones positivas explícitas para garantizar nitidez tipográfica y geométrica (`sharp focus throughout, deep depth of field`, `consistent lighting, smooth motion`, `straight rectilinear lines, crisp grid geometry`).

---

## 1. Módulo 0 · Errores numéricos (`errores`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Kling 3.0 · **Camera preset:** `Dolly In`
- **Prompt (MCSLA):**
  A precision matte-obsidian optical laboratory bench displays glowing cyan micrometer tick marks dividing a ruler interval into discrete steps, slowly illuminated as a bright emerald laser marker glides smoothly onto the exact value beside an amber rounded tick. Macro editorial look on dark brushed aluminum with subtle cyan rim reflection, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, consistent lighting, smooth motion. Slow `Dolly In` moving forward along the optical scale so the discrete gap between truncation and symmetric rounding becomes clearly separated.
- **Vibe Motion overlay brief:**
  Render animated IEEE-754 mantissa cells (`1.x × 10^e`), progressively lighting digits one-by-one while plotting partial Taylor polynomial curves `S_n(x)` folding smoothly onto `e^x` on a 1920×1080 transparent layer (`JetBrains Mono`, 60 fps).

---

## 2. Módulo 1 · Ecuaciones no lineales (`ecuaciones`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Seedance 2.0 · **Camera preset:** `Robo Arm`
- **Prompt (MCSLA):**
  On a dark charcoal engineering glass table, a thin luminous cyan parabolic wire intersects a silver horizontal datum plane while a warm amber laser beam shoots obliquely from the upper curve downward to strike the datum line, bouncing vertically back up to fire a second steeper tangent directly into the glowing emerald root marker. Clean architectural studio look with balanced rim reflections on glass, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, smooth motion. Controlled `Robo Arm` sweeping smoothly across the tangent cascade at constant speed.
- **Vibe Motion overlay brief:**
  Display progressive multi-iteration Newton-Raphson coordinate readouts (`x₀ = 2.0000 → x₁ = 1.6364 → x₂ = 1.5304 → x₃ = 1.5214`) synchronized with quadratic convergence badges (`p = 2` vs `φ ≈ 1.618` vs `p = 1`).

---

## 3. Módulo 2 · Sistemas de ecuaciones lineales (`sistemas`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Kling 3.0 · **Camera preset:** `Arc`
- **Prompt (MCSLA):**
  Inside a dark cobalt glass room, three translucent frosted acrylic planes tinted cyan, amber, and violet smoothly slide along illuminated axes to lock cleanly at one glowing emerald intersection point in three-dimensional space while coordinate guide beams align along the orthogonal path of Gauss-Seidel. Minimalist technical studio look on dark slate floor, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, consistent lighting, smooth motion. Steady `Arc` orbiting gently around the intersection point at eye level.
- **Vibe Motion overlay brief:**
  Animate a 3×3 augmented matrix `[A|b]` highlighting partial pivot row swaps and strict diagonal dominance comparisons (`|aᵢᵢ| > Σ|aᵢⱼ|`), updating the live `||b − Ax⁽ᵏ⁾||_∞` residual gauge down to `10⁻⁷`.

---

## 4. Módulo 3 · Interpolación y regresión (`interpolacion`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Wan 2.7 · **Camera preset:** `Dolly Right`
- **Prompt (MCSLA):**
  Four suspended silver calibration spheres glow above a dark gridded slate surface while a thin white optical fiber ribbon flexes smoothly through every sphere center, contrasted immediately afterward against a straight taut amber laser rod holding balanced equilibrium with vertical red tension springs pulling equally from both sides. Clean scientific bench look, deep matte indigo backdrop, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, consistent lighting. Smooth `Dolly Right` gliding parallel to the four data spheres.
- **Vibe Motion overlay brief:**
  Render individual Lagrange basis curves `L₀(x)..L₃(x)` peaking at `y = 1` over their home node and hitting `0` at peer nodes before summing into `P(x)` vs the least-squares regression line `ŷ = 0.9 + 0.9x` (`R² ≈ 0.853`).

---

## 5. Módulo 4 · Integración y derivación numérica (`integracion`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Seedance 2.0 · **Camera preset:** `Overhead`
- **Prompt (MCSLA):**
  On an architectural dark drafting board, translucent frosted blue trapezoidal acrylic blocks stack neatly under a curved amber fiber ridge before morphing smoothly into emerald curved parabolic arches that seal flush in tight continuous contact against the ridge as the vertical partitions double in density. Clean studio drafting look under soft top-down diffuser light, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, smooth motion. Locked `Overhead` descending slightly to frame the seamless parabolic fit.
- **Vibe Motion overlay brief:**
  Draw Simpson node weight badges `(×1, ×4, ×2, ×4, ×1)` over `[0, 2]` and animate a synchronized log-log U-curve contrasting truncation `O(h²)` against floating-point roundoff `O(ε/h)` around `h ≈ 10⁻⁵`.

---

## 6. Módulo 5 · Ecuaciones diferenciales ordinarias (`diferenciales`)

- **Aspect ratio:** 16:9 · **Duración sugerida:** 6s · **Model:** Kling 3.0 · **Camera preset:** `Dolly In`
- **Prompt (MCSLA):**
  A matte-black thermal laboratory chamber displays thousands of tiny brass compass needles aligned in a smooth exponential cooling flow field while four color-coded weighted tangent lasers align sequentially at the start, midpoints, and end of a time interval to steer a glowing emerald capsule accurately along the curve toward ambient equilibrium. Crisp technical photography look with cool steel highlights, straight rectilinear lines, crisp grid geometry, sharp focus throughout, deep depth of field, consistent lighting, smooth motion. Smooth `Dolly In` tracking alongside the capsule from `t = 0` to `t = 0.5`.
- **Vibe Motion overlay brief:**
  Overlay the four RK4 slopes (`k₁`, `k₂`, `k₃`, `k₄`), explicit Euler step trajectory (`h = 0.5`), and a stability regime switcher demonstrating oscillatory divergence at `h = 5` (`R = −1.5`) vs non-physical crossing at `h = 3` (`R = −0.5`).
