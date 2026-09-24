import {type Usuario } from "../types/auth"

export const USAR_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true"

export const USUARIOS_MOCK: (Usuario & { senha: string })[] = [
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