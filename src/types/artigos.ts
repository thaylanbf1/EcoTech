import type { Perfil } from "./auth"

export type StatusSubmissao =
  | "rascunho"
  | "submetido"
  | "em_avaliacao"
  | "aprovado"
  | "aprovado_ressalvas"
  | "reprovado"

export type StatusAtribuicao = "pendente" | "rascunho" | "enviada" | "edicao_liberada"

export type Recomendacao = "aprovar" | "aprovar_ressalvas" | "reprovar"

export interface Pessoa {
  nome: string
  email: string
  instituicao: string
}

export interface ArquivoArtigo {
  nome: string
  tamanho: number
  // null quando não deu para contar as páginas do PDF
  paginas: number | null
}

// Linha das listas de submissões
export interface ResumoSubmissao {
  id: string
  titulo: string
  status: StatusSubmissao
  submetidoEm: string | null
  criadoEm: string
  // Autor da conta primeiro, depois os coautores
  autores: string[]
  // Só nas listas do admin
  avaliadores?: string[]
}

export interface DadosSubmissao {
  titulo: string
  resumo: string
  palavrasChave: string[]
  coautores: Pessoa[]
}

export interface Submissao extends DadosSubmissao {
  id: string
  status: StatusSubmissao
  submetidoEm: string | null
  criadoEm: string
  autores: Pessoa[]
  arquivo: ArquivoArtigo | null
  // Só para o autor, e só depois do resultado (sem o nome de quem avaliou)
  pareceres?: Parecer[]
}

export interface Parecer {
  recomendacao: Recomendacao
  parecer: string
  enviadaEm: string
}

// O que o admin vê de cada avaliação
export interface Atribuicao {
  id: string
  submissaoId: string
  titulo: string
  avaliadorId: string
  avaliador: string
  prazo: string
  status: StatusAtribuicao
  parecer: string
  recomendacao: Recomendacao | null
  enviadaEm: string | null
  alteracaoSolicitadaEm: string | null
}

export interface SubmissaoAdmin extends Submissao {
  atribuicoes: Atribuicao[]
}

// O que o avaliador vê: o artigo sem os autores (avaliação cega)
export interface TrabalhoAvaliador {
  id: string
  submissaoId: string
  titulo: string
  resumo: string
  palavrasChave: string[]
  arquivo: ArquivoArtigo | null
  prazo: string
  status: StatusAtribuicao
  parecer: string
  recomendacao: Recomendacao | null
  enviadaEm: string | null
  alteracaoSolicitadaEm: string | null
}

export interface DadosAvaliacao {
  parecer: string
  recomendacao: Recomendacao | null
}

export interface Avaliador {
  id: string
  nome: string
  email: string
  instituicao: string
  // Avaliações ainda em aberto
  trabalhos: number
}

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  perfil: Perfil
  instituicao: string
  criadoEm: string
}

export interface NovoUsuario {
  nome: string
  email: string
  instituicao: string
  perfil: Perfil
  senha: string
}

export interface ResumoAdmin {
  submissoes: number
  avaliadores: number
  usuarios: number
  eventoAtivo: boolean
}
