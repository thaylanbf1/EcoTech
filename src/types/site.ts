export type TemplateSite = "classico" | "moderno" | "minimalista"

// Páginas prontas: o conteúdo vem do sistema (atividades, palestras, Sobre...)
export type TemplatePronto =
  | "inicio"
  | "sobre"
  | "cronograma"
  | "palestras"
  | "exposicoes"
  | "local"
  | "acessibilidade"
  | "patrocinadores"
  | "parceiros"
  | "inscricao"

// Páginas livres: o conteúdo é escrito no próprio item do menu
export type TemplateLivre = "texto" | "cartoes" | "perguntas" | "link"

export type TemplatePagina = TemplatePronto | TemplateLivre

// Um cartão (template "cartoes") ou uma pergunta (template "perguntas")
export interface BlocoPagina {
  titulo: string
  descricao: string
  // Data URL; "" = sem imagem
  imagem: string
}

// Conteúdo das páginas livres. Cada template usa só os campos dele.
export interface ConteudoPagina {
  titulo: string
  texto: string
  imagem: string
  blocos: BlocoPagina[]
  // Só no template "link"
  url: string
}

export interface ItemMenu {
  id: string
  rotulo: string
  // Rota interna (/cronograma, /pagina/minha-pagina) ou, no "link", o endereço externo
  to: string
  visivel: boolean
  // Ausente nos menus salvos antes dos templates: sai da rota
  template?: TemplatePagina
  conteudo?: ConteudoPagina
}

// Tudo que o admin edita na identidade e na página inicial
export interface ConfigSite {
  titulo: string
  descricao: string
  dataExibicao: string
  localExibicao: string
  template: TemplateSite
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  // Imagem em data URL; "" = usa a imagem padrão do projeto
  logoUrl: string
  bannerUrl: string
  menu: ItemMenu[]
}

export type StatusEvento = "ativo" | "encerrado"

export interface SiteResposta extends ConfigSite {
  status: StatusEvento
  dataInicio: string
}

export interface EventoAnterior {
  id: string
  nome: string
  encerradoEm: string
  dataInicio: string
  dataFim: string
  local: string
  inscritos: number
  atividades: number
  // Como o site estava ao encerrar (textos, cores, template e menu)
  site: ConfigSite
}
