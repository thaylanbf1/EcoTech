import { useState, type ReactNode } from "react"
import { login } from "../api/auth"
import { lerSessao, limparSessao, salvarSessao } from "../helpers/sessao"
import type { Credenciais, Usuario } from "../types/auth"
import { AuthContext } from "./AuthContext"

export function AuthProvider({ children }: { children: ReactNode }) {
  // Recupera a sessão salva para o usuário continuar logado ao recarregar
  const [usuario, setUsuario] = useState<Usuario | null>(() => lerSessao()?.usuario ?? null)

  const entrar = async (credenciais: Credenciais) => {
    const sessao = await login(credenciais)
    salvarSessao(sessao)
    setUsuario(sessao.usuario)
    return sessao.usuario
  }

  const sair = () => {
    limparSessao()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}
