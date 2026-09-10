
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import Home from "./pages/Home"
import Sobre from "./pages/Sobre"
import Cronograma from "./pages/Cronograma"
import Exposicoes from "./pages/Exposicoes"
import Local from "./pages/Local"
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
          <Route path="/exposicoes" element={<Exposicoes/>}/>
          <Route path="/local" element={<Local/>}/>
          <Route path="/patrocinadores" element={<Patrocinadores/>}/>
          <Route path="/parceiros" element={<Parceiros/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
