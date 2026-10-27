import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Recursos from './pages/Recursos'
import Modulo1 from './modules/m1/Modulo1'
import MetodosCerrados from './modules/m1/MetodosCerrados'
import MetodosAbiertos from './modules/m1/MetodosAbiertos'
import RaicesPolinomios from './modules/m1/RaicesPolinomios'
import ModuloErrores from './modules/errores/ModuloErrores'
import Modulo2 from './modules/m2/Modulo2'
import MetodosDirectos from './modules/m2/MetodosDirectos'
import MetodosIterativos from './modules/m2/MetodosIterativos'
import Modulo3 from './modules/m3/Modulo3'
import PaginaLagrange from './modules/m3/PaginaLagrange'
import PaginaRegresion from './modules/m3/PaginaRegresion'
import Modulo4 from './modules/m4/Modulo4'
import PaginaTrapecio from './modules/m4/PaginaTrapecio'
import PaginaSimpson from './modules/m4/PaginaSimpson'
import PaginaDerivacion from './modules/m4/PaginaDerivacion'
import Modulo5 from './modules/m5/Modulo5'
import PaginaEuler from './modules/m5/PaginaEuler'
import PaginaRK4 from './modules/m5/PaginaRK4'
import PaginaEstabilidad from './modules/m5/PaginaEstabilidad'
import './styles.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="recursos" element={<Recursos />} />
        <Route path="errores" element={<ModuloErrores />} />
        <Route path="ecuaciones" element={<Modulo1 />} />
        <Route path="ecuaciones/cerrados" element={<MetodosCerrados />} />
        <Route path="ecuaciones/abiertos" element={<MetodosAbiertos />} />
        <Route path="ecuaciones/polinomios" element={<RaicesPolinomios />} />
        <Route path="sistemas" element={<Modulo2 />} />
        <Route path="sistemas/directos" element={<MetodosDirectos />} />
        <Route path="sistemas/iterativos" element={<MetodosIterativos />} />
        <Route path="interpolacion" element={<Modulo3 />} />
        <Route path="interpolacion/lagrange" element={<PaginaLagrange />} />
        <Route path="interpolacion/regresion" element={<PaginaRegresion />} />
        <Route path="integracion" element={<Modulo4 />} />
        <Route path="integracion/trapecio" element={<PaginaTrapecio />} />
        <Route path="integracion/simpson" element={<PaginaSimpson />} />
        <Route path="integracion/derivacion" element={<PaginaDerivacion />} />
        <Route path="diferenciales" element={<Modulo5 />} />
        <Route path="diferenciales/euler" element={<PaginaEuler />} />
        <Route path="diferenciales/rk4" element={<PaginaRK4 />} />
        <Route path="diferenciales/estabilidad" element={<PaginaEstabilidad />} />
        <Route path="*" element={<p>Página no encontrada.</p>} />
      </Route>
    </Routes>
  )
}
