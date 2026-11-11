import { del, get, post, put } from "../api/api"
import { axiosClient } from "../api/axiosClient"
import { comTratamento } from "../api/erros"
import type {
  Atribuicao,
  Avaliador,
  DadosAvaliacao,
  DadosSubmissao,
  NovoUsuario,
  ResumoAdmin,
  ResumoSubmissao,
  Submissao,
  SubmissaoAdmin,
  TrabalhoAvaliador,
  UsuarioAdmin,
} from "../types/artigos"
import type { Perfil } from "../types/auth"

// Submissão e avaliação de artigos. Não há versão no modo simulado
// (VITE_USE_MOCK): essas telas precisam da API e do banco.

// ---------- autor ----------

export const listarMinhasSubmissoes = () => comTratamento(() => get<ResumoSubmissao[]>("/autor/submissoes"))

export const obterMinhaSubmissao = (id: string) => comTratamento(() => get<Submissao>(`/autor/submissoes/${id}`))

export const criarSubmissao = (dados: DadosSubmissao) =>
  comTratamento(() => post<Submissao>("/autor/submissoes", dados))

export const salvarSubmissao = (id: string, dados: DadosSubmissao) =>
  comTratamento(() => put<Submissao>(`/autor/submissoes/${id}`, dados))

// O PDF vai puro no corpo; o nome segue num cabeçalho (codificado por causa dos acentos)
export const enviarArquivo = (id: string, arquivo: File) =>
  comTratamento(async () => {
    const resposta = await axiosClient.put<Submissao>(`/autor/submissoes/${id}/arquivo`, arquivo, {
      headers: { "Content-Type": "application/pdf", "X-Nome-Arquivo": encodeURIComponent(arquivo.name) },
    })
    return resposta.data
  })

export const enviarParaAvaliacao = (id: string) =>
  comTratamento(() => post<Submissao>(`/autor/submissoes/${id}/enviar`, {}))

export const excluirRascunho = (id: string) => comTratamento(() => del<void>(`/autor/submissoes/${id}`))

// Baixa com o token da sessão (um link comum não levaria o token)
export const baixarPdf = (submissaoId: string, nome: string) =>
  comTratamento(async () => {
    const resposta = await axiosClient.get<Blob>(`/artigos/${submissaoId}/arquivo`, { responseType: "blob" })
    const url = URL.createObjectURL(resposta.data)
    const link = document.createElement("a")
    link.href = url
    link.download = nome
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  })

// ---------- avaliador ----------

export const listarTrabalhos = () => comTratamento(() => get<TrabalhoAvaliador[]>("/avaliador/atribuicoes"))

export const obterTrabalho = (id: string) => comTratamento(() => get<TrabalhoAvaliador>(`/avaliador/atribuicoes/${id}`))

export const salvarRascunhoAvaliacao = (id: string, dados: DadosAvaliacao) =>
  comTratamento(() => put<TrabalhoAvaliador>(`/avaliador/atribuicoes/${id}`, dados))

export const enviarAvaliacao = (id: string, dados: DadosAvaliacao) =>
  comTratamento(() => post<TrabalhoAvaliador>(`/avaliador/atribuicoes/${id}/enviar`, dados))

export const solicitarAlteracao = (id: string) =>
  comTratamento(() => post<TrabalhoAvaliador>(`/avaliador/atribuicoes/${id}/solicitar-alteracao`, {}))

// ---------- admin ----------

export const obterResumoAdmin = () => comTratamento(() => get<ResumoAdmin>("/admin/resumo"))

export const listarSubmissoes = () => comTratamento(() => get<ResumoSubmissao[]>("/admin/submissoes"))

export const obterSubmissao = (id: string) => comTratamento(() => get<SubmissaoAdmin>(`/admin/submissoes/${id}`))

export const listarAvaliadores = () => comTratamento(() => get<Avaliador[]>("/admin/avaliadores"))

export const atribuirAvaliadores = (submissaoId: string, avaliadorIds: string[], prazo: string) =>
  comTratamento(() => put<void>(`/admin/submissoes/${submissaoId}/avaliadores`, { avaliadorIds, prazo }))

export const listarAvaliacoes = () => comTratamento(() => get<Atribuicao[]>("/admin/avaliacoes"))

export const liberarEdicao = (id: string, justificativa: string) =>
  comTratamento(() => post<void>(`/admin/avaliacoes/${id}/liberar`, { justificativa }))

export const listarUsuarios = () => comTratamento(() => get<UsuarioAdmin[]>("/admin/usuarios"))

export const criarUsuario = (dados: NovoUsuario) => comTratamento(() => post<UsuarioAdmin>("/admin/usuarios", dados))

export const alterarPerfil = (id: string, perfil: Perfil) =>
  comTratamento(() => put<UsuarioAdmin>(`/admin/usuarios/${id}/perfil`, { perfil }))
