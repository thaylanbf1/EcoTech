import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes/route"
import { AuthProvider } from "./context/AuthProvider"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
