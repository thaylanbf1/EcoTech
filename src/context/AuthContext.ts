import { createContext } from "react"
import type { Credenciais, Usuario } from "../types/auth"

export interface AuthContextValor {
  usuario: Usuario | null
  entrar: (credenciais: Credenciais) => Promise<Usuario>
  sair: () => void
}

export const AuthContext = createContext<AuthContextValor | null>(null)
