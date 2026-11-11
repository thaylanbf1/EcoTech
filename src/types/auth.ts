export type Perfil = "participante" | "admin" | "autor" | "avaliador"

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  instituicao?: string
}

// O login não recebe perfil: quem decide se a conta é de admin ou de
// participante é o servidor, a partir da própria conta.
export interface Credenciais {
  email: string
  senha: string
}

// Cadastro público: sempre cria uma conta de autor
export interface DadosCadastro {
  nome: string
  email: string
  instituicao: string
  senha: string
  aceite: boolean
}

// Formato esperado da resposta de POST /auth/login
export interface LoginResposta {
  token: string
  usuario: Usuario
}
