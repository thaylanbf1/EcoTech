// Preenche o banco com autores, avaliadores Ad-Hoc e artigos fictícios em
// várias etapas da avaliação, para testar e apresentar as telas.
// Todas as contas usam e-mails @exemplo.com e a mesma senha, mostrada no fim.
// Uso:    npm run db:artigos
// Limpar: npm run db:artigos -- --limpar

import { randomBytes } from "node:crypto"
import { pool, transacao } from "../db.ts"
import { gerarHashSenha } from "../seguranca.ts"
import { recalcularSituacao } from "../rotas/artigos.ts"

const DOMINIO = "@exemplo.com"

const AUTORES = [
  { nome: "Maria Silva", email: `maria.silva${DOMINIO}`, instituicao: "UEPA" },
  { nome: "João Lima", email: `joao.lima${DOMINIO}`, instituicao: "UFPA" },
]
const AVALIADORES = [
  { nome: "Carlos Pereira", email: `carlos.pereira${DOMINIO}`, instituicao: "UEPA" },
  { nome: "Fernanda Alves", email: `fernanda.alves${DOMINIO}`, instituicao: "IFPA" },
  { nome: "Juliana Matos", email: `juliana.matos${DOMINIO}`, instituicao: "UFRA" },
]

type Etapa = "rascunho" | "sem_avaliador" | "em_avaliacao" | "avaliado"

const ARTIGOS: { titulo: string; autor: number; palavras: string[]; etapa: Etapa; avaliacoes?: [number, string][] }[] = [
  { titulo: "Arquitetura de microsserviços aplicada na Amazônia", autor: 0, palavras: ["Microsserviços", "Arquitetura", "Amazônia"], etapa: "em_avaliacao" },
  { titulo: "Ensino de testes de software em escolas públicas", autor: 0, palavras: ["Testes", "Ensino"], etapa: "avaliado", avaliacoes: [[1, "aprovar"]] },
  { titulo: "IA para triagem de requisitos", autor: 0, palavras: ["IA", "Requisitos"], etapa: "rascunho" },
  { titulo: "Gamificação no ensino de engenharia de requisitos", autor: 1, palavras: ["Gamificação", "Requisitos", "Ensino"], etapa: "em_avaliacao" },
  { titulo: "Métricas de qualidade em projetos open source", autor: 1, palavras: ["Qualidade", "Open source", "Métricas"], etapa: "avaliado", avaliacoes: [[0, "aprovar"], [2, "aprovar_ressalvas"]] },
  { titulo: "Visualização de dívida técnica em repositórios", autor: 1, palavras: ["Dívida técnica"], etapa: "sem_avaliador" },
]

const RESUMO =
  "Este trabalho apresenta uma abordagem aplicada ao contexto de desenvolvimento de software na região amazônica, " +
  "discutindo desafios, decisões de projeto e resultados observados em estudos de caso conduzidos com equipes locais."

// PDF mínimo de uma página, só para ter o que baixar
const PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF",
  "latin1"
)

if (process.argv.includes("--limpar")) {
  // Apagar as contas apaga os artigos e as avaliações junto (on delete cascade)
  const { rowCount } = await pool.query(
    `delete from usuarios where email = any($1)`,
    [[...AUTORES, ...AVALIADORES].map((p) => p.email)]
  )
  console.info(`✓ Removidas ${rowCount} contas de exemplo, com os artigos e avaliações`)
  await pool.end()
  process.exit(0)
}

const senha = randomBytes(6).toString("base64url")
const hash = await gerarHashSenha(senha)

const ids: Record<string, string> = {}
for (const [perfil, pessoas] of [["autor", AUTORES], ["avaliador", AVALIADORES]] as const) {
  for (const p of pessoas) {
    const { rows } = await pool.query(
      `insert into usuarios (nome, email, instituicao, perfil, senha_hash) values ($1, $2, $3, $4, $5)
       on conflict (email) do update set senha_hash = excluded.senha_hash
       returning id`,
      [p.nome, p.email, p.instituicao, perfil, hash]
    )
    ids[p.email] = rows[0].id
  }
}

let criados = 0
for (const [i, a] of ARTIGOS.entries()) {
  const autorId = ids[AUTORES[a.autor].email]
  const existe = await pool.query("select 1 from submissoes where autor_id = $1 and titulo = $2", [autorId, a.titulo])
  if (existe.rowCount) continue

  await transacao(async (db) => {
    const enviado = a.etapa !== "rascunho"
    const { rows } = await db.query(
      `insert into submissoes (autor_id, titulo, resumo, palavras_chave, coautores, status, arquivo, arquivo_nome,
                               arquivo_tamanho, arquivo_paginas, submetido_em)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, case when $10 then now() - make_interval(days => $11) end)
       returning id`,
      [
        autorId, a.titulo, RESUMO, a.palavras,
        JSON.stringify(i === 0 ? [{ nome: "Pedro Alves", email: `pedro.alves${DOMINIO}`, instituicao: "UEPA" }] : []),
        enviado ? "submetido" : "rascunho", PDF, `artigo-${i + 1}.pdf`, PDF.length, enviado, 20 - i,
      ]
    )
    const id = rows[0].id

    // Em avaliação: Carlos ainda não enviou. Avaliado: cada um enviou a sua.
    const avaliacoes = a.etapa === "em_avaliacao" ? [[0, null]] : a.etapa === "avaliado" ? a.avaliacoes ?? [] : []
    for (const [avaliador, recomendacao] of avaliacoes) {
      await db.query(
        `insert into atribuicoes (submissao_id, avaliador_id, prazo, status, parecer, recomendacao, enviada_em)
         values ($1, $2, current_date + 15, $3, $4, $5, case when $5::text is not null then now() end)`,
        [
          id, ids[AVALIADORES[avaliador as number].email], recomendacao ? "enviada" : "pendente",
          recomendacao ? "Trabalho consistente, com metodologia clara e resultados bem discutidos." : "", recomendacao,
        ]
      )
    }
    await recalcularSituacao(db, id)
  })
  criados += 1
}

console.info(`✓ ${criados} artigos criados (${ARTIGOS.length - criados} já existiam)`)
console.info("\nContas de exemplo (todas com a mesma senha):")
for (const p of AUTORES) console.info(`  Autor      ${p.email}`)
for (const p of AVALIADORES) console.info(`  Avaliador  ${p.email}`)
console.info(`  Senha:     ${senha}`)
console.info("\nA senha muda a cada vez que o script roda.")
await pool.end()
