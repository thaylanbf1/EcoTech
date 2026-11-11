import { Router } from "express"
import { pool, transacao } from "../db.ts"
import { eventoEncerrado } from "../repositorio.ts"
import { ErroHttp, exigirLogin, gerarHashSenha } from "../seguranca.ts"
import {
  esquemaAtribuicao,
  esquemaLiberacao,
  esquemaNovoUsuario,
  esquemaPerfil,
  validar,
} from "../validacao.ts"
import { SQL_RESUMO_SUBMISSAO, conferirId, detalheSubmissao, recalcularSituacao } from "./artigos.ts"

// Submissões, avaliações e usuários. Todas exigem sessão de administrador.
export const rotasAdminArtigos = Router()
rotasAdminArtigos.use(exigirLogin("admin"))
rotasAdminArtigos.param("id", conferirId("Registro"))

const SQL_ATRIBUICOES = `
  select a.id, a.submissao_id as "submissaoId", s.titulo, a.avaliador_id as "avaliadorId", u.nome as "avaliador",
         a.prazo, a.status, a.parecer, a.recomendacao, a.enviada_em as "enviadaEm",
         a.alteracao_solicitada_em as "alteracaoSolicitadaEm"
    from atribuicoes a
    join usuarios u on u.id = a.avaliador_id
    join submissoes s on s.id = a.submissao_id`

rotasAdminArtigos.get("/resumo", async (_req, res) => {
  const { rows } = await pool.query(
    `select (select count(*)::int from submissoes where status <> 'rascunho') as submissoes,
            (select count(*)::int from usuarios where perfil = 'avaliador') as avaliadores,
            (select count(*)::int from usuarios) as usuarios`
  )
  res.json({ ...rows[0], eventoAtivo: !(await eventoEncerrado()) })
})

// ---------- submissões ----------

// Rascunhos são do autor: o admin só vê o que foi enviado
rotasAdminArtigos.get("/submissoes", async (_req, res) => {
  const { rows } = await pool.query(
    `select r.*, coalesce(
              (select array_agg(u.nome order by u.nome) from atribuicoes a join usuarios u on u.id = a.avaliador_id
                where a.submissao_id = r.id), '{}') as avaliadores
       from (${SQL_RESUMO_SUBMISSAO} where s.status <> 'rascunho') r
      order by r."submetidoEm" desc`
  )
  res.json(rows)
})

rotasAdminArtigos.get("/submissoes/:id", async (req, res) => {
  const s = await detalheSubmissao(req.params.id)
  if (!s || s.status === "rascunho") throw new ErroHttp(404, "Artigo não encontrado.")
  const { rows } = await pool.query(`${SQL_ATRIBUICOES} where a.submissao_id = $1 order by u.nome`, [s.id])
  res.json({ ...s, atribuicoes: rows })
})

// Define quem avalia o artigo. Quem saiu da lista perde o trabalho, a não ser
// que já tenha enviado a avaliação (essa fica guardada).
rotasAdminArtigos.put("/submissoes/:id/avaliadores", async (req, res) => {
  const { avaliadorIds, prazo } = validar(esquemaAtribuicao, req.body)
  await transacao(async (db) => {
    const s = await db.query("select id from submissoes where id = $1 and status <> 'rascunho' for update", [req.params.id])
    if (!s.rows[0]) throw new ErroHttp(404, "Artigo não encontrado.")

    const validos = await db.query("select id from usuarios where id = any($1) and perfil = 'avaliador'", [avaliadorIds])
    if (validos.rowCount !== new Set(avaliadorIds).size) throw new ErroHttp(400, "Escolha apenas avaliadores Ad-Hoc.")

    await db.query(
      `delete from atribuicoes where submissao_id = $1 and not (avaliador_id = any($2)) and status <> 'enviada'`,
      [req.params.id, avaliadorIds]
    )
    await db.query(
      `insert into atribuicoes (submissao_id, avaliador_id, prazo)
       select $1, unnest($2::uuid[]), $3
       on conflict (submissao_id, avaliador_id) do update set prazo = excluded.prazo
        where atribuicoes.status <> 'enviada'`,
      [req.params.id, avaliadorIds, prazo]
    )
    await recalcularSituacao(db, req.params.id)
  })
  res.status(204).end()
})

// ---------- avaliadores e avaliações ----------

// "trabalhos" = avaliações ainda em aberto, para o admin dividir a carga
rotasAdminArtigos.get("/avaliadores", async (_req, res) => {
  const { rows } = await pool.query(
    `select u.id, u.nome, u.email, u.instituicao,
            (select count(*)::int from atribuicoes a where a.avaliador_id = u.id and a.status <> 'enviada') as trabalhos
       from usuarios u where u.perfil = 'avaliador' order by u.nome`
  )
  res.json(rows)
})

rotasAdminArtigos.get("/avaliacoes", async (_req, res) => {
  const { rows } = await pool.query(
    `${SQL_ATRIBUICOES} where s.status <> 'rascunho'
      order by a.alteracao_solicitada_em desc nulls last, a.enviada_em desc nulls last, s.titulo`
  )
  res.json(rows)
})

// Destrava uma avaliação enviada para o avaliador corrigir. Fica no histórico.
rotasAdminArtigos.post("/avaliacoes/:id/liberar", async (req, res) => {
  const { justificativa } = validar(esquemaLiberacao, req.body)
  await transacao(async (db) => {
    const { rows } = await db.query(
      `update atribuicoes set status = 'edicao_liberada', alteracao_solicitada_em = null
        where id = $1 and status = 'enviada' returning submissao_id`,
      [req.params.id]
    )
    if (!rows[0]) throw new ErroHttp(409, "Só dá para liberar uma avaliação já enviada.")
    await db.query("insert into liberacoes_avaliacao (atribuicao_id, admin_id, justificativa) values ($1, $2, $3)", [
      req.params.id,
      req.usuario!.id,
      justificativa,
    ])
    await recalcularSituacao(db, rows[0].submissao_id)
  })
  res.status(204).end()
})

// ---------- usuários ----------

const SQL_USUARIO = `select id, nome, email, perfil, instituicao, criado_em as "criadoEm" from usuarios`

rotasAdminArtigos.get("/usuarios", async (_req, res) => {
  const { rows } = await pool.query(`${SQL_USUARIO} order by criado_em desc`)
  res.json(rows)
})

rotasAdminArtigos.post("/usuarios", async (req, res) => {
  const u = validar(esquemaNovoUsuario, req.body)
  const { rows } = await pool.query(
    `insert into usuarios (nome, email, instituicao, perfil, senha_hash) values ($1, $2, $3, $4, $5)
     on conflict (email) do nothing
     returning id, nome, email, perfil, instituicao, criado_em as "criadoEm"`,
    [u.nome, u.email, u.instituicao, u.perfil, await gerarHashSenha(u.senha)]
  )
  if (!rows[0]) throw new ErroHttp(409, "Já existe uma conta com este e-mail.")
  res.status(201).json(rows[0])
})

rotasAdminArtigos.put("/usuarios/:id/perfil", async (req, res) => {
  const { perfil } = validar(esquemaPerfil, req.body)
  // Sem isso, o admin poderia tirar o próprio acesso ao painel
  if (req.params.id === req.usuario!.id) throw new ErroHttp(409, "Você não pode alterar o seu próprio perfil.")
  const { rows } = await pool.query(
    `update usuarios set perfil = $1 where id = $2
     returning id, nome, email, perfil, instituicao, criado_em as "criadoEm"`,
    [perfil, req.params.id]
  )
  // O perfil é lido do banco a cada pedido, então já vale na próxima ação
  if (!rows[0]) throw new ErroHttp(404, "Usuário não encontrado.")
  res.json(rows[0])
})
