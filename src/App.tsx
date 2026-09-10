
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import Home from "./pages/Home"
import Sobre from "./pages/Sobre"
import Cronograma from "./pages/Cronograma"
import Patrocinadores from "./pages/Patrocinadores"
import Parceiros from "./pages/Parceiros"

function App() {
  return (
    <BrowserRouter>
    <NavBar/>
      <main>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/sobre" element={<Sobre/>}/>
          <Route path="/cronograma" element={<Cronograma/>}/>
          <Route path="/patrocinadores" element={<Patrocinadores/>}/>
          <Route path="/parceiros" element={<Parceiros/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
