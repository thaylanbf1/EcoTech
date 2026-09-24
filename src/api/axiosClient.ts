import axios from "axios"
import { lerSessao } from "../helpers/sessao"

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Envia o token do usuário logado em todas as requisições
axiosClient.interceptors.request.use((config) => {
  const token = lerSessao()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
