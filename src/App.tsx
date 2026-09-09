
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import Home from "./pages/Home"
import Cronograma from "./pages/Cronograma"

function App() {
  return (
    <BrowserRouter>
    <NavBar/>
      <main>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/cronograma" element={<Cronograma/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
