// Cadastra edições passadas fictícias em "eventos anteriores", cada uma com o
// próprio template, cores e menu, para a página pública ter o que mostrar.
// Uso:    npm run db:anteriores
// Limpar: npm run db:anteriores -- --limpar

import { pool } from "../db.ts"
import { ROTAS_CONHECIDAS, SITE_PADRAO } from "../../src/consts/site.ts"
import type { ConfigSite, TemplateSite } from "../../src/types/site.ts"

// Menu a partir das rotas do site; "ocultos" ficam com visivel = false
function menu(rotas: string[], ocultos: string[] = []): ConfigSite["menu"] {
  return rotas.map((to) => ({
    id: to === "/" ? "inicio" : to.slice(1),
    rotulo: ROTAS_CONHECIDAS.find((r) => r.to === to)!.rotulo,
    to,
    visivel: !ocultos.includes(to),
  }))
}

interface Edicao {
  titulo: string
  descricao: string
  dataExibicao: string
  inicio: string
  fim: string
  local: string
  template: TemplateSite
  cores: [string, string, string]
  menu: ConfigSite["menu"]
  inscritos: number
  atividades: number
}

const EDICOES: Edicao[] = [
  {
    titulo: "Ciclo de Palestras em Engenharia de Software",
    descricao: "Uma tarde de palestras com profissionais e pesquisadores da região sobre o presente e o futuro da engenharia de software.",
    dataExibicao: "12 de Agosto de 2026",
    inicio: "2026-08-12",
    fim: "2026-08-12",
    local: "Belém, Pará",
    template: "moderno",
    cores: ["#0b5d4b", "#f2b134", "#eef5f0"],
    menu: menu(["/", "/sobre", "/palestras", "/inscricao", "/local", "/parceiros"], ["/local"]),
    inscritos: 86,
    atividades: 4,
  },
  {
    titulo: "Mostra de Projetos Integradores",
    descricao: "Estudantes apresentam os projetos integradores do semestre para professores, empresas e a comunidade.",
    dataExibicao: "20 de Junho de 2026",
    inicio: "2026-06-20",
    fim: "2026-06-20",
    local: "Ananindeua, Pará",
    template: "minimalista",
    cores: ["#5b2a86", "#f2557a", "#fbeff3"],
    menu: menu(["/", "/sobre", "/exposicoes", "/local"]),
    inscritos: 140,
    atividades: 2,
  },
  {
    titulo: "Workshop de Testes de Software",
    descricao: "Um dia de prática com testes automatizados, testes de interface e integração contínua, do básico ao avançado.",
    dataExibicao: "14 de Março de 2026",
    inicio: "2026-03-14",
    fim: "2026-03-14",
    local: "Online",
    template: "moderno",
    cores: ["#0f4c81", "#00a6a6", "#eef2f5"],
    menu: menu(["/", "/sobre", "/cronograma", "/inscricao"]),
    inscritos: 212,
    atividades: 5,
  },
  {
    titulo: "Semana Acadêmica de Computação",
    descricao: "Quatro dias de palestras, minicursos e maratona de programação com cursos de computação de todo o estado.",
    dataExibicao: "25 a 28 de Novembro de 2025",
    inicio: "2025-11-25",
    fim: "2025-11-28",
    local: "Belém, Pará",
    template: "classico",
    cores: ["#7a1f2b", "#e8a33d", "#fbf3ec"],
    menu: menu(["/", "/sobre", "/cronograma", "/palestras", "/local", "/patrocinadores", "/inscricao"]),
    inscritos: 318,
    atividades: 12,
  },
  {
    titulo: "Hackathon Amazônia Digital",
    descricao: "Trinta e seis horas para criar soluções digitais para desafios reais de cidades e comunidades da Amazônia.",
    dataExibicao: "06 e 07 de Setembro de 2025",
    inicio: "2025-09-06",
    fim: "2025-09-07",
    local: "Ananindeua, Pará",
    template: "minimalista",
    cores: ["#1c1c1c", "#a8cf45", "#f5f5f0"],
    menu: menu(["/", "/sobre", "/cronograma", "/parceiros", "/inscricao"], ["/parceiros"]),
    inscritos: 64,
    atividades: 3,
  },
]

const nomes = EDICOES.map((e) => e.titulo)

if (process.argv.includes("--limpar")) {
  const { rowCount } = await pool.query("delete from eventos_anteriores where nome = any($1)", [nomes])
  console.info(`✓ Removidas ${rowCount} edições de exemplo`)
  await pool.end()
  process.exit(0)
}

let criadas = 0
for (const e of EDICOES) {
  const site: ConfigSite = {
    ...SITE_PADRAO,
    titulo: e.titulo,
    descricao: e.descricao,
    dataExibicao: e.dataExibicao,
    localExibicao: e.local,
    template: e.template,
    corPrimaria: e.cores[0],
    corSecundaria: e.cores[1],
    corFundo: e.cores[2],
    logoUrl: "",
    bannerUrl: "",
    menu: e.menu,
  }
  // Encerrada uma semana depois do fim, como se o admin tivesse arquivado
  const { rowCount } = await pool.query(
    `insert into eventos_anteriores (nome, data_inicio, data_fim, local, inscritos, atividades, site, encerrado_em)
     select $1, $2, $3, $4, $5, $6, $7, $3::date + 7
      where not exists (select 1 from eventos_anteriores where nome = $1)`,
    [e.titulo, e.inicio, e.fim, e.local, e.inscritos, e.atividades, JSON.stringify(site)]
  )
  criadas += rowCount ?? 0
}

console.info(`✓ ${criadas} edições anteriores criadas (${EDICOES.length - criadas} já existiam)`)
await pool.end()
