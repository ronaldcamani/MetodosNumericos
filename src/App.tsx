import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Modulo1 from './modules/m1/Modulo1'
import Modulo2 from './modules/m2/Modulo2'
import Modulo3 from './modules/m3/Modulo3'
import Modulo4 from './modules/m4/Modulo4'
import './styles.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="m1" element={<Modulo1 />} />
        <Route path="m2" element={<Modulo2 />} />
        <Route path="m3" element={<Modulo3 />} />
        <Route path="m4" element={<Modulo4 />} />
        <Route path="*" element={<p>Página no encontrada.</p>} />
      </Route>
    </Routes>
  )
}
