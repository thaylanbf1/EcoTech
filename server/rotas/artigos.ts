import express, { Router, type NextFunction, type Request, type Response } from "express"
import { z } from "zod"
import { pool, transacao, type Conexao } from "../db.ts"
import { eventoEncerrado } from "../repositorio.ts"
import { ErroHttp, exigirLogin } from "../seguranca.ts"
import { esquemaAvaliacao, esquemaSubmissao, validar } from "../validacao.ts"

export const TAMANHO_MAXIMO_PDF = 10 * 1024 * 1024

// ":id" precisa ser um UUID; sem isso o Postgres responderia com erro 500
export function conferirId(nome: string) {
  return (_req: Request, _res: Response, next: NextFunction, id: string) => {
    next(z.uuid().safeParse(id).success ? undefined : new ErroHttp(404, `${nome} não encontrado.`))
  }
}

// ---------- consultas usadas por autor, avaliador e admin ----------

// Nomes de quem escreveu: o autor da conta e os coautores, nessa ordem
const SQL_AUTORES = `array_prepend(u.nome, array(select c->>'nome' from jsonb_array_elements(s.coautores) c))`

export const SQL_RESUMO_SUBMISSAO = `
  select s.id, s.titulo, s.status, s.submetido_em as "submetidoEm", s.criado_em as "criadoEm",
         ${SQL_AUTORES} as autores
    from submissoes s join usuarios u on u.id = s.autor_id`

export async function detalheSubmissao(id: string, conexao: Conexao = pool) {
  const { rows } = await conexao.query(
    `select s.id, s.titulo, s.status, s.resumo, s.palavras_chave as "palavrasChave",
            s.submetido_em as "submetidoEm", s.criado_em as "criadoEm", s.autor_id as "autorId",
            jsonb_build_array(jsonb_build_object('nome', u.nome, 'email', u.email, 'instituicao', u.instituicao))
              || s.coautores as autores,
            s.coautores,
            case when s.arquivo_nome is null then null
                 else jsonb_build_object('nome', s.arquivo_nome, 'tamanho', s.arquivo_tamanho, 'paginas', s.arquivo_paginas)
            end as arquivo
       from submissoes s join usuarios u on u.id = s.autor_id
      where s.id = $1`,
    [id]
  )
  return rows[0] ?? null
}

// A situação do artigo sai das avaliações: sem avaliador = submetido; alguma
// em aberto = em avaliação; todas enviadas = a recomendação mais rigorosa
export async function recalcularSituacao(conexao: Conexao, submissaoId: string) {
  await conexao.query(
    `update submissoes s set status = case
        when not exists (select 1 from atribuicoes a where a.submissao_id = s.id) then 'submetido'
        when exists (select 1 from atribuicoes a where a.submissao_id = s.id and a.status <> 'enviada') then 'em_avaliacao'
        when exists (select 1 from atribuicoes a where a.submissao_id = s.id and a.recomendacao = 'reprovar') then 'reprovado'
        when exists (select 1 from atribuicoes a where a.submissao_id = s.id and a.recomendacao = 'aprovar_ressalvas') then 'aprovado_ressalvas'
        else 'aprovado' end
      where s.id = $1 and s.status <> 'rascunho'`,
    [submissaoId]
  )
}

// Conta as páginas procurando os objetos "/Type /Page" do PDF. Não funciona
// em todo PDF (alguns comprimem essa parte); aí a tela só não mostra o número.
function contarPaginas(pdf: Buffer) {
  const total = pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g)?.length ?? 0
  return total || null
}

// ---------- autor ----------

export const rotasAutor = Router()
rotasAutor.use(exigirLogin("autor"))
rotasAutor.param("id", conferirId("Artigo"))

async function submissaoDoAutor(req: Request, conexao: Conexao = pool) {
  const s = await detalheSubmissao(req.params.id as string, conexao)
  if (!s || s.autorId !== req.usuario!.id) throw new ErroHttp(404, "Artigo não encontrado.")
  return s
}

async function rascunhoDoAutor(req: Request, conexao: Conexao = pool) {
  const s = await submissaoDoAutor(req, conexao)
  if (s.status !== "rascunho") throw new ErroHttp(409, "Este artigo já foi enviado e não pode mais ser alterado.")
  return s
}

rotasAutor.get("/submissoes", async (req, res) => {
  const { rows } = await pool.query(`${SQL_RESUMO_SUBMISSAO} where s.autor_id = $1 order by s.criado_em desc`, [
    req.usuario!.id,
  ])
  res.json(rows)
})

const RESULTADOS = ["aprovado", "aprovado_ressalvas", "reprovado"]

// Quando sai o resultado, o autor vê os pareceres, sem saber quem avaliou
rotasAutor.get("/submissoes/:id", async (req, res) => {
  const s = await submissaoDoAutor(req)
  const { rows: pareceres } = RESULTADOS.includes(s.status)
    ? await pool.query(
        `select recomendacao, parecer, enviada_em as "enviadaEm" from atribuicoes
          where submissao_id = $1 and status = 'enviada' order by enviada_em`,
        [s.id]
      )
    : { rows: [] }
  res.json({ ...s, pareceres })
})

rotasAutor.post("/submissoes", async (req, res) => {
  const d = validar(esquemaSubmissao, req.body)
  const { rows } = await pool.query(
    `insert into submissoes (autor_id, titulo, resumo, palavras_chave, coautores)
     values ($1, $2, $3, $4, $5) returning id`,
    [req.usuario!.id, d.titulo, d.resumo, d.palavrasChave, JSON.stringify(d.coautores)]
  )
  res.status(201).json(await detalheSubmissao(rows[0].id))
})

rotasAutor.put("/submissoes/:id", async (req, res) => {
  const d = validar(esquemaSubmissao, req.body)
  const s = await rascunhoDoAutor(req)
  await pool.query(
    "update submissoes set titulo = $1, resumo = $2, palavras_chave = $3, coautores = $4 where id = $5",
    [d.titulo, d.resumo, d.palavrasChave, JSON.stringify(d.coautores), s.id]
  )
  res.json(await detalheSubmissao(s.id))
})

// O PDF chega puro no corpo (Content-Type: application/pdf), sem base64
rotasAutor.put(
  "/submissoes/:id/arquivo",
  express.raw({ type: "application/pdf", limit: TAMANHO_MAXIMO_PDF }),
  async (req, res) => {
    const s = await rascunhoDoAutor(req)
    const pdf = req.body
    if (!Buffer.isBuffer(pdf) || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new ErroHttp(400, "Envie o artigo em PDF.")
    }
    // O nome vem codificado (encodeURIComponent) para aceitar acentos.
    // Fica só o nome, sem caminho, e com um tamanho razoável.
    let nome = "artigo.pdf"
    try {
      nome = decodeURIComponent(String(req.headers["x-nome-arquivo"] ?? nome)).replace(/^.*[\\/]/, "").slice(0, 120) || nome
    } catch {
      // nome mal codificado: fica o padrão
    }
    await pool.query(
      "update submissoes set arquivo = $1, arquivo_nome = $2, arquivo_tamanho = $3, arquivo_paginas = $4 where id = $5",
      [pdf, nome, pdf.length, contarPaginas(pdf), s.id]
    )
    res.json(await detalheSubmissao(s.id))
  }
)

rotasAutor.post("/submissoes/:id/enviar", async (req, res) => {
  await transacao(async (db) => {
    const s = await rascunhoDoAutor(req, db)
    if (await eventoEncerrado(db)) throw new ErroHttp(409, "As submissões deste evento foram encerradas.")
    if (s.resumo.length < 50) throw new ErroHttp(400, "Escreva um resumo com pelo menos 50 caracteres.")
    if (!s.palavrasChave.length) throw new ErroHttp(400, "Informe pelo menos uma palavra-chave.")
    if (!s.arquivo) throw new ErroHttp(400, "Anexe o PDF do artigo.")
    await db.query("update submissoes set status = 'submetido', submetido_em = now() where id = $1", [s.id])
  })
  res.json(await detalheSubmissao(req.params.id as string))
})

rotasAutor.delete("/submissoes/:id", async (req, res) => {
  const s = await rascunhoDoAutor(req)
  await pool.query("delete from submissoes where id = $1", [s.id])
  res.status(204).end()
})

// ---------- avaliador Ad-Hoc ----------

export const rotasAvaliador = Router()
rotasAvaliador.use(exigirLogin("avaliador"))
rotasAvaliador.param("id", conferirId("Trabalho"))

// O avaliador não vê quem escreveu o artigo (avaliação cega)
const SQL_ATRIBUICAO = `
  select a.id, a.prazo, a.status, a.parecer, a.recomendacao, a.enviada_em as "enviadaEm",
         a.alteracao_solicitada_em as "alteracaoSolicitadaEm",
         s.id as "submissaoId", s.titulo, s.resumo, s.palavras_chave as "palavrasChave",
         case when s.arquivo_nome is null then null
              else jsonb_build_object('nome', s.arquivo_nome, 'tamanho', s.arquivo_tamanho, 'paginas', s.arquivo_paginas)
         end as arquivo
    from atribuicoes a join submissoes s on s.id = a.submissao_id`

async function atribuicaoDoAvaliador(req: Request, conexao: Conexao = pool) {
  const { rows } = await conexao.query(`${SQL_ATRIBUICAO} where a.id = $1 and a.avaliador_id = $2`, [
    req.params.id,
    req.usuario!.id,
  ])
  if (!rows[0]) throw new ErroHttp(404, "Trabalho não encontrado.")
  return rows[0]
}

const EDITAVEL = ["pendente", "rascunho", "edicao_liberada"]

rotasAvaliador.get("/atribuicoes", async (req, res) => {
  const { rows } = await pool.query(`${SQL_ATRIBUICAO} where a.avaliador_id = $1 order by a.prazo, s.titulo`, [
    req.usuario!.id,
  ])
  res.json(rows)
})

rotasAvaliador.get("/atribuicoes/:id", async (req, res) => {
  res.json(await atribuicaoDoAvaliador(req))
})

// Rascunho: guarda o que já foi escrito sem enviar
rotasAvaliador.put("/atribuicoes/:id", async (req, res) => {
  const { parecer, recomendacao } = validar(esquemaAvaliacao, req.body)
  const a = await atribuicaoDoAvaliador(req)
  if (!EDITAVEL.includes(a.status)) throw new ErroHttp(409, "Esta avaliação já foi enviada e está bloqueada.")
  await pool.query(
    `update atribuicoes set parecer = $1, recomendacao = $2,
            status = case when status = 'edicao_liberada' then status else 'rascunho' end
      where id = $3`,
    [parecer, recomendacao, a.id]
  )
  res.json(await atribuicaoDoAvaliador(req))
})

rotasAvaliador.post("/atribuicoes/:id/enviar", async (req, res) => {
  const { parecer, recomendacao } = validar(esquemaAvaliacao, req.body)
  if (parecer.length < 20) throw new ErroHttp(400, "Escreva um parecer com pelo menos 20 caracteres.")
  if (!recomendacao) throw new ErroHttp(400, "Escolha uma recomendação.")
  await transacao(async (db) => {
    const a = await atribuicaoDoAvaliador(req, db)
    if (!EDITAVEL.includes(a.status)) throw new ErroHttp(409, "Esta avaliação já foi enviada e está bloqueada.")
    await db.query(
      `update atribuicoes set parecer = $1, recomendacao = $2, status = 'enviada', enviada_em = now(),
              alteracao_solicitada_em = null
        where id = $3`,
      [parecer, recomendacao, a.id]
    )
    await recalcularSituacao(db, a.submissaoId)
  })
  res.json(await atribuicaoDoAvaliador(req))
})

// Avisa o admin de que o avaliador quer corrigir uma avaliação já enviada
rotasAvaliador.post("/atribuicoes/:id/solicitar-alteracao", async (req, res) => {
  const a = await atribuicaoDoAvaliador(req)
  if (a.status !== "enviada") throw new ErroHttp(409, "Só dá para pedir alteração de uma avaliação enviada.")
  await pool.query("update atribuicoes set alteracao_solicitada_em = now() where id = $1", [a.id])
  res.json(await atribuicaoDoAvaliador(req))
})

// ---------- PDF ----------

export const rotasArquivo = Router()
rotasArquivo.param("id", conferirId("Artigo"))

// Quem pode baixar: o admin, o autor do artigo e os avaliadores atribuídos
rotasArquivo.get("/artigos/:id/arquivo", exigirLogin(), async (req, res) => {
  const u = req.usuario!
  const { rows } = await pool.query(
    `select s.arquivo, s.arquivo_nome as nome from submissoes s
      where s.id = $1 and s.arquivo is not null
        and ($2 = 'admin' or s.autor_id = $3
             or exists (select 1 from atribuicoes a where a.submissao_id = s.id and a.avaliador_id = $3))`,
    [req.params.id, u.perfil, u.id]
  )
  if (!rows[0]) throw new ErroHttp(404, "Arquivo não encontrado.")
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(rows[0].nome)}`,
  })
  res.send(rows[0].arquivo)
})
