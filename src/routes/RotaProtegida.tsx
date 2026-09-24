import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import type { Perfil } from "../types/auth"

interface RotaProtegidaProps {
  perfil: Perfil
  children: ReactNode
}

// Só mostra a página se houver alguém logado com o perfil exigido.
// Caso contrário, manda para /login guardando de onde a pessoa veio.
export default function RotaProtegida({ perfil, children }: RotaProtegidaProps) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario || usuario.perfil !== perfil) {
    return <Navigate to="/login" replace state={{ de: location.pathname, perfil }} />
  }

  return children
}
