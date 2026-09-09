
import { BrowserRouter, Route, Routes } from "react-router-dom"
import NavBar from "./components/NavBar"
import Home from "./pages/Home"

function App() {
  return (
    <BrowserRouter>
    <NavBar/>
      <main>
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
