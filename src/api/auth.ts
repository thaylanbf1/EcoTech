import { isAxiosError } from "axios"
import { post } from "./api"
import type { Credenciais, LoginResposta, Usuario } from "../types/auth"

// Enquanto o backend não existe, o login é simulado. O mock só liga em
// desenvolvimento (npm run dev) e com VITE_USE_MOCK=true no .env, para
// que as contas de teste nunca funcionem no site publicado.
const USAR_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true"

const USUARIOS_MOCK: (Usuario & { senha: string })[] = [
  {
    id: "1",
    nome: "Participante Teste",
    email: "participante@ecotech.com",
    senha: "123456",
    perfil: "participante",
  },
  {
    id: "2",
    nome: "Admin EcoTech",
    email: "admin@ecotech.com",
    senha: "admin123",
    perfil: "admin",
  },
]

async function loginMock({ email, senha, perfil }: Credenciais): Promise<LoginResposta> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const encontrado = USUARIOS_MOCK.find(
    (u) => u.email === email.trim().toLowerCase() && u.senha === senha && u.perfil === perfil
  )
  if (!encontrado) throw new Error("E-mail ou senha inválidos.")

  const usuario: Usuario = {
    id: encontrado.id,
    nome: encontrado.nome,
    email: encontrado.email,
    perfil: encontrado.perfil,
  }
  return { token: `mock-token-${usuario.id}`, usuario }
}

export async function login(credenciais: Credenciais): Promise<LoginResposta> {
  if (USAR_MOCK) return loginMock(credenciais)

  try {
    const resposta = await post<LoginResposta, Credenciais>("/auth/login", credenciais)
    // Garante que um participante não entre pela aba de administrador (e vice-versa)
    if (resposta.usuario.perfil !== credenciais.perfil) {
      throw new Error("E-mail ou senha inválidos.")
    }
    return resposta
  } catch (erro) {
    if (isAxiosError(erro)) {
      if (erro.response?.status === 401) {
        throw new Error("E-mail ou senha inválidos.", { cause: erro })
      }
      throw new Error("Não foi possível conectar ao servidor. Tente novamente.", { cause: erro })
    }
    throw erro
  }
}
