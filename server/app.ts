import express, { type NextFunction, type Request, type Response } from "express"
import cors from "cors"
import helmet from "helmet"
import { ErroHttp } from "./seguranca.ts"
import { rotasAuth } from "./rotas/auth.ts"
import { rotasPagamento, rotasPublicas, rotasParticipante } from "./rotas/inscricoes.ts"
import { rotasAdmin } from "./rotas/admin.ts"
import { rotasAdminArtigos } from "./rotas/adminArtigos.ts"
import { rotasArquivo, rotasAutor, rotasAvaliador } from "./rotas/artigos.ts"

export const app = express()

// Atrás de um proxy (Render, Railway, Vercel...), usa o IP real do visitante
// no limite de tentativas
app.set("trust proxy", 1)
app.use(helmet())
// Em dev o Vite repassa /api para cá (mesma origem). CORS só é necessário se
// o front for publicado em outro domínio: informe-o em FRONTEND_URL.
if (process.env.FRONTEND_URL) app.use(cors({ origin: process.env.FRONTEND_URL }))
// A personalização do site leva imagens (data URL, inclusive das páginas
// livres do menu): limite maior só nestas rotas
app.use(["/api/admin/site", "/api/admin/sobre"], express.json({ limit: "8mb" }))
app.use(express.json({ limit: "50kb" }))

const api = express.Router()
// Usada pelo npm run diagnostico para saber se quem responde na porta é esta API
api.get("/saude", (_req, res) => {
  res.json({ api: "inscricoes", ok: true })
})
api.use("/auth", rotasAuth)
api.use("/minha-inscricao", rotasParticipante)
api.use("/admin", rotasAdmin)
api.use("/admin", rotasAdminArtigos)
api.use("/autor", rotasAutor)
api.use("/avaliador", rotasAvaliador)
api.use(rotasArquivo)
api.use("/pagamentos", rotasPagamento)
api.use(rotasPublicas)
api.use((_req, _res, next) => next(new ErroHttp(404, "Rota não encontrada.")))
app.use("/api", api)

// Erros conhecidos viram { mensagem } com o status certo; o resto vira 500
// sem detalhes para o navegador (o detalhe fica só no log do servidor).
// O Express só reconhece o tratador de erros se ele tiver os 4 parâmetros
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((erro: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ErroHttp) {
    res.status(erro.status).json({ mensagem: erro.message })
    return
  }
  if (erro instanceof SyntaxError && "body" in erro) {
    res.status(400).json({ mensagem: "Dados inválidos." })
    return
  }
  // Corpo acima do limite (ex.: PDF de mais de 10 MB)
  if (erro instanceof Error && "type" in erro && erro.type === "entity.too.large") {
    const pdf = req.headers["content-type"] === "application/pdf"
    res.status(413).json({ mensagem: pdf ? "O PDF pode ter no máximo 10 MB." : "Os dados enviados são grandes demais." })
    return
  }
  console.error(erro)
  res.status(500).json({ mensagem: "Algo deu errado. Tente novamente." })
})
