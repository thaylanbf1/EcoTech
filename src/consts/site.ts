import type { ConfigSite, ConteudoPagina, ItemMenu, TemplateLivre, TemplatePagina, TemplatePronto } from "../types/site"

// Sem import.meta.env: também é lido pelo servidor (Node)
export const ROTAS_CONHECIDAS = [
  { to: "/", rotulo: "Início" },
  { to: "/sobre", rotulo: "Sobre" },
  { to: "/cronograma", rotulo: "Cronograma" },
  { to: "/palestras", rotulo: "Palestras" },
  { to: "/exposicoes", rotulo: "Exposições" },
  { to: "/local", rotulo: "Local" },
  { to: "/acessibilidade", rotulo: "Acessibilidade" },
  { to: "/patrocinadores", rotulo: "Patrocinadores" },
  { to: "/parceiros", rotulo: "Parceiros" },
  { to: "/inscricao", rotulo: "Inscrição" },
]

export const SITE_PADRAO: ConfigSite = {
  titulo: "Primeiro Encontro de tecnologia pensado a partir da Amazônia",
  descricao:
    "Dois dias de palestras, minicurso e trocas entre estudantes, pesquisadores e profissionais que constroem tecnologia na região — e para ela.",
  dataExibicao: "15 a 16 de Outubro",
  localExibicao: "Ananindeua, Pará",
  template: "classico",
  corPrimaria: "#03285b",
  corSecundaria: "#a8cf45",
  corFundo: "#f4efe6",
  logoUrl: "",
  bannerUrl: "",
  menu: ROTAS_CONHECIDAS.filter((r) => r.to !== "/patrocinadores" && r.to !== "/parceiros").map((r) => ({
    id: r.to === "/" ? "inicio" : r.to.slice(1),
    rotulo: r.rotulo,
    to: r.to,
    visivel: true,
  })),
}

// ---------- templates das páginas do menu ----------

// Prefixo das páginas livres criadas pelo admin
export const PREFIXO_PAGINA_LIVRE = "/pagina/"

// Cada rota pronta vira um template; o id sai da rota ("/" = "inicio")
export const TEMPLATES_PRONTOS: { id: TemplatePronto; nome: string; to: string; descricao: string }[] = [
  { id: "inicio", nome: "Início", to: "/", descricao: "Página inicial do evento." },
  { id: "sobre", nome: "Sobre", to: "/sobre", descricao: "Texto, carrossel, parceiros e patrocinadores da página Sobre." },
  { id: "cronograma", nome: "Cronograma", to: "/cronograma", descricao: "Programação do evento, dia a dia." },
  { id: "palestras", nome: "Palestras", to: "/palestras", descricao: "Palestras e palestrantes." },
  { id: "exposicoes", nome: "Exposições", to: "/exposicoes", descricao: "Trabalhos expostos, com fotos." },
  { id: "local", nome: "Local", to: "/local", descricao: "Endereço e mapa." },
  { id: "acessibilidade", nome: "Acessibilidade", to: "/acessibilidade", descricao: "Recursos de acessibilidade." },
  { id: "patrocinadores", nome: "Patrocinadores", to: "/patrocinadores", descricao: "Logos dos patrocinadores por nível." },
  { id: "parceiros", nome: "Parceiros", to: "/parceiros", descricao: "Logos dos parceiros." },
  { id: "inscricao", nome: "Inscrição", to: "/inscricao", descricao: "Formulário de inscrição e pagamento." },
]

export const TEMPLATES_LIVRES: { id: TemplateLivre; nome: string; descricao: string }[] = [
  { id: "texto", nome: "Texto e imagem", descricao: "Um título, parágrafos e uma imagem opcional." },
  { id: "cartoes", nome: "Cartões", descricao: "Grade de cartões com título, texto e imagem." },
  { id: "perguntas", nome: "Perguntas e respostas", descricao: "Perguntas que abrem e fecham, boas para dúvidas frequentes." },
  { id: "link", nome: "Link externo", descricao: "O item do menu leva para outro site." },
]

export const IDS_TEMPLATES_PAGINA = [
  ...TEMPLATES_PRONTOS.map((t) => t.id),
  ...TEMPLATES_LIVRES.map((t) => t.id),
] as [TemplatePagina, ...TemplatePagina[]]

export function templateLivre(t: TemplatePagina): t is TemplateLivre {
  return TEMPLATES_LIVRES.some((l) => l.id === t)
}

export function nomeTemplate(t: TemplatePagina): string {
  return [...TEMPLATES_PRONTOS, ...TEMPLATES_LIVRES].find((x) => x.id === t)?.nome ?? t
}

// Menus salvos antes dos templates não têm "template": sai da rota
export function templateDoItem(item: ItemMenu): TemplatePagina {
  return item.template ?? TEMPLATES_PRONTOS.find((t) => t.to === item.to)?.id ?? "texto"
}

export const conteudoVazio = (): ConteudoPagina => ({ titulo: "", texto: "", imagem: "", blocos: [], url: "" })

// Página livre que ainda não recebeu nada (a prévia mostra um exemplo)
export const conteudoEmBranco = (c?: ConteudoPagina) =>
  !c || (!c.titulo.trim() && !c.texto.trim() && !c.imagem && c.blocos.length === 0)

// "Programação & Oficinas!" -> "programacao-oficinas"
export function slugDe(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "pagina"
  )
}

export const linkExterno = (to: string) => /^https?:\/\//i.test(to)
