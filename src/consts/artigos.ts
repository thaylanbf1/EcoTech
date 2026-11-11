import type { Perfil } from "../types/auth"
import type { Recomendacao, StatusAtribuicao, StatusSubmissao } from "../types/artigos"

// Rótulo e cores do selo de cada situação, iguais nas telas de autor e admin
export const STATUS_SUBMISSAO: Record<StatusSubmissao, { rotulo: string; cor: string }> = {
  rascunho: { rotulo: "Rascunho", cor: "bg-slate-100 text-slate-600" },
  submetido: { rotulo: "Submetido", cor: "bg-eco-blue-soft text-eco-blue" },
  em_avaliacao: { rotulo: "Em avaliação", cor: "bg-eco-orange-soft text-orange-700" },
  aprovado: { rotulo: "Aprovado", cor: "bg-green-100 text-green-700" },
  aprovado_ressalvas: { rotulo: "Aprovado com ressalvas", cor: "bg-yellow-100 text-yellow-800" },
  reprovado: { rotulo: "Reprovado", cor: "bg-red-100 text-red-700" },
}

export const STATUS_ATRIBUICAO: Record<StatusAtribuicao, { rotulo: string; cor: string }> = {
  pendente: { rotulo: "Pendente", cor: "bg-eco-orange-soft text-orange-700" },
  rascunho: { rotulo: "Rascunho salvo", cor: "bg-slate-100 text-slate-600" },
  enviada: { rotulo: "Enviada", cor: "bg-eco-blue-soft text-eco-blue" },
  edicao_liberada: { rotulo: "Edição liberada", cor: "bg-purple-100 text-purple-700" },
}

export const RECOMENDACOES: { id: Recomendacao; rotulo: string; descricao: string; cor: string; destaque: string }[] = [
  {
    id: "aprovar",
    rotulo: "Aprovar",
    descricao: "O artigo pode ser aceito como está.",
    cor: "bg-green-100 text-green-700",
    destaque: "border-green-600 bg-green-50 text-green-700",
  },
  {
    id: "aprovar_ressalvas",
    rotulo: "Aprovar com ressalvas",
    descricao: "Aceito após ajustes indicados no parecer.",
    cor: "bg-eco-orange-soft text-orange-700",
    destaque: "border-orange-700 bg-eco-orange-soft text-orange-700",
  },
  {
    id: "reprovar",
    rotulo: "Reprovar",
    descricao: "O artigo não atende aos critérios do evento.",
    cor: "bg-red-100 text-red-700",
    destaque: "border-red-600 bg-red-50 text-red-700",
  },
]

export const recomendacao = (id: Recomendacao) => RECOMENDACOES.find((r) => r.id === id)!

export const PERFIS: Record<Perfil, { rotulo: string; descricao: string; cor: string }> = {
  autor: { rotulo: "Autor", descricao: "Submete e acompanha seus trabalhos", cor: "bg-eco-blue-soft text-eco-blue" },
  avaliador: { rotulo: "Avaliador Ad-Hoc", descricao: "Avalia os trabalhos atribuídos a você", cor: "bg-eco-orange-soft text-orange-700" },
  admin: { rotulo: "Administrador", descricao: "Gerencia evento, usuários e avaliações", cor: "bg-purple-100 text-purple-700" },
  participante: { rotulo: "Participante", descricao: "Inscrito no evento", cor: "bg-green-100 text-green-700" },
}

// Para onde cada perfil vai depois de entrar
export const INICIO_DO_PERFIL: Record<Perfil, string> = {
  participante: "/minha-conta",
  autor: "/autor",
  avaliador: "/avaliador",
  admin: "/admin",
}

export const TAMANHO_MAXIMO_PDF_MB = 10
