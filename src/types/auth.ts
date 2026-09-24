export type Perfil = "participante" | "admin"

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

export interface Credenciais {
  email: string
  senha: string
  perfil: Perfil
}

// Formato esperado da resposta de POST /auth/login
export interface LoginResposta {
  token: string
  usuario: Usuario
}
