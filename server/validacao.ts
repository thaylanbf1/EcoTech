import { z } from "zod"
import { CAMPOS_CATEGORIA, CATEGORIAS, OPCOES_ACESSIBILIDADE, TAMANHO_MINIMO_SENHA } from "../src/consts/inscricao.ts"
import { ErroHttp } from "./seguranca.ts"
import { IDS_TEMPLATES_PAGINA, PREFIXO_PAGINA_LIVRE, TEMPLATES_PRONTOS, templateDoItem, templateLivre } from "../src/consts/site.ts"

// Tudo que chega do navegador passa por aqui antes de tocar no banco.
// As regras são as mesmas das telas, mas o servidor não confia nelas.

const texto = (max: number) => z.string().trim().max(max)

export const esquemaEmail = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Informe um e-mail válido.")

export const esquemaSenha = z
  .string()
  .min(TAMANHO_MINIMO_SENHA, `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
  .max(200)

const esquemaNome = texto(120).min(3, "Informe o nome completo.")
const esquemaInstituicao = texto(160)

export const esquemaCadastroAutor = z.object({
  nome: esquemaNome,
  email: esquemaEmail,
  instituicao: esquemaInstituicao.min(2, "Informe a instituição."),
  senha: esquemaSenha,
  aceite: z.literal(true, "Aceite os termos de uso para continuar."),
})

export const esquemaConta = z.object({ nome: esquemaNome, instituicao: esquemaInstituicao })

export const PERFIS = ["participante", "autor", "avaliador", "admin"] as const

export const esquemaNovoUsuario = z.object({
  nome: esquemaNome,
  email: esquemaEmail,
  instituicao: esquemaInstituicao,
  perfil: z.enum(PERFIS),
  senha: esquemaSenha,
})

export const esquemaPerfil = z.object({ perfil: z.enum(PERFIS) })

export const esquemaParticipante = z
  .object({
    nome: texto(120).min(3, "Informe o nome completo."),
    email: esquemaEmail,
    telefone: texto(20).refine((t) => t.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
    categoria: z.enum(CATEGORIAS as [string, ...string[]]),
    detalhes: z.record(z.string(), texto(120)),
    pcd: z.boolean(),
    recursos: z.array(z.enum(OPCOES_ACESSIBILIDADE.map((o) => o.id) as [string, ...string[]])).max(10),
    outroRecurso: texto(200),
  })
  .transform((dados) => {
    // Guarda só os campos da categoria escolhida
    const campos = CAMPOS_CATEGORIA[dados.categoria as keyof typeof CAMPOS_CATEGORIA].campos
    const detalhes = Object.fromEntries(campos.map((c) => [c.chave, dados.detalhes[c.chave] ?? ""]))
    return {
      ...dados,
      detalhes,
      recursos: dados.pcd ? [...new Set(dados.recursos)] : [],
      outroRecurso: dados.pcd ? dados.outroRecurso : "",
    }
  })
  .superRefine((dados, ctx) => {
    if (Object.values(dados.detalhes).some((v) => !v)) {
      ctx.addIssue({ code: "custom", message: "Preencha os dados da sua categoria." })
    }
  })

const esquemaIds = z.array(z.uuid()).max(20)

export const esquemaNovaInscricao = z.object({
  participante: esquemaParticipante,
  senha: esquemaSenha,
  atividadesIds: esquemaIds,
})

export const esquemaTrocaAtividades = z.object({ atividadesIds: esquemaIds })

const hora = z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.")
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")

export const esquemaAtividade = z
  .object({
    titulo: texto(150).min(1, "Informe o título da atividade."),
    tipo: z.enum(["Minicurso", "Oficina"]),
    palestrante: texto(120).min(1, "Informe quem ministra."),
    dia: z.number().int().min(1).max(30),
    inicio: hora,
    fim: hora,
    local: texto(80).min(1, "Informe o local."),
    nivel: z.enum(["Iniciante", "Intermediário", "Avançado", "Todos os níveis"]),
    vagas: z.number().int().min(1, "Informe pelo menos 1 vaga.").max(10000),
    valor: z.number().min(0, "O valor não pode ser negativo.").max(100000),
  })
  .refine((a) => a.inicio < a.fim, "O horário de término precisa ser depois do início.")

export const esquemaEvento = z
  .object({
    nome: texto(150).min(1, "Informe o nome do evento."),
    dataInicio: data,
    dataFim: data,
    horario: texto(60).min(1),
    local: texto(200).min(1),
    valorInscricao: z.number().min(0, "O valor da inscrição não pode ser negativo.").max(100000),
    incluiNaInscricao: texto(300).min(1),
    prazoTrocaAtividades: data,
    prazoReembolso: data,
  })
  .refine((e) => e.dataFim >= e.dataInicio, "A data de término precisa ser depois do início.")
  .refine((e) => e.prazoReembolso <= e.dataInicio, "O prazo de reembolso precisa ser antes do evento.")

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.")
const imagem = z
  .string()
  .max(1_400_000, "Imagem muito pesada.")
  .refine((v) => v === "" || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v), "Imagem inválida.")

const urlExterna = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s<>"]+$/i.test(v), "Link inválido. Use um endereço que comece com https://")

// Conteúdo das páginas livres (texto, cartões, perguntas, link)
const conteudoPagina = z.object({
  titulo: texto(150),
  texto: texto(5000),
  imagem,
  blocos: z
    .array(z.object({ titulo: texto(120), descricao: texto(1500), imagem }))
    .max(30, "Uma página pode ter no máximo 30 cartões ou perguntas."),
  url: urlExterna,
})

const itemMenu = z
  .object({
    id: texto(60).min(1),
    rotulo: texto(30).min(1, "Todo item do menu precisa de um nome."),
    to: z
      .string()
      .max(500)
      .refine((v) => /^\/[a-z0-9\-/]*$/i.test(v) || /^https?:\/\/[^\s<>"]+$/i.test(v), "Rota inválida."),
    visivel: z.boolean(),
    template: z.enum(IDS_TEMPLATES_PAGINA).optional(),
    conteudo: conteudoPagina.optional(),
  })
  .superRefine((item, ctx) => {
    const template = templateDoItem(item)
    const erro = (message: string) => ctx.addIssue({ code: "custom", message })
    if (template === "link") {
      if (!item.conteudo?.url) erro(`Informe o endereço do link "${item.rotulo}".`)
      else if (item.to !== item.conteudo.url) erro("Rota inválida.")
    } else if (templateLivre(template)) {
      if (!item.to.startsWith(PREFIXO_PAGINA_LIVRE) || item.to.length <= PREFIXO_PAGINA_LIVRE.length) erro("Rota inválida.")
    } else if (item.to !== TEMPLATES_PRONTOS.find((t) => t.id === template)!.to) {
      erro("Rota inválida.")
    }
  })

export const esquemaSite = z.object({
  titulo: texto(150).min(1, "Informe o título principal."),
  descricao: texto(400).min(1, "Informe a descrição."),
  dataExibicao: texto(60).min(1, "Informe a data."),
  localExibicao: texto(80).min(1, "Informe o local."),
  template: z.enum(["classico", "moderno", "minimalista"]),
  corPrimaria: cor,
  corSecundaria: cor,
  corFundo: cor,
  logoUrl: imagem,
  bannerUrl: imagem,
  menu: z
    .array(itemMenu)
    .min(1)
    .max(20)
    .refine((menu) => {
      const internas = menu.map((i) => i.to).filter((to) => to.startsWith("/"))
      return new Set(internas).size === internas.length
    }, "Dois itens do menu levam para a mesma página. Mude o nome de um deles."),
})

const logo = z
  .string()
  .max(400_000, "Logo muito pesada.")
  .refine(
    (v) => v === "" || /^\/logos\/[\w.-]+$/.test(v) || /^https:\/\/\S+$/.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
    "Logo inválida."
  )
const entidade = z.object({ id: texto(40).min(1), nome: texto(80).min(1, "Informe o nome de cada parceiro/patrocinador."), logo })

export const esquemaSobre = z.object({
  titulo: texto(150).min(1, "Informe o título."),
  texto: texto(1500).min(1, "Informe o texto."),
  itens: z.array(z.object({ titulo: texto(40).min(1, "Todo item do carrossel precisa de título."), descricao: texto(500).min(1, "Todo item do carrossel precisa de descrição.") })).max(12),
  parceiros: z.array(entidade).max(40),
  patrocinadores: z.object({
    master: z.array(entidade).max(1),
    ouro: z.array(entidade).max(20),
    prata: z.array(entidade).max(40),
  }),
})

// Valida e devolve os dados limpos; se algo estiver errado, responde 400
// com a primeira mensagem, que a tela mostra para a pessoa.
export function validar<T>(esquema: z.ZodType<T>, dados: unknown): T {
  const resultado = esquema.safeParse(dados)
  if (!resultado.success) {
    throw new ErroHttp(400, resultado.error.issues[0]?.message ?? "Dados inválidos.")
  }
  return resultado.data
}

// ---------- artigos ----------

const esquemaCoautor = z.object({ nome: esquemaNome, email: esquemaEmail, instituicao: esquemaInstituicao })

// Rascunho: só o título é obrigatório. O resto é conferido ao enviar.
export const esquemaSubmissao = z.object({
  titulo: texto(250).min(3, "Informe o título do artigo."),
  resumo: texto(3000),
  palavrasChave: z.array(texto(40).min(1)).max(8, "Use no máximo 8 palavras-chave."),
  coautores: z.array(esquemaCoautor).max(10, "Informe no máximo 10 coautores."),
})

export const RECOMENDACOES = ["aprovar", "aprovar_ressalvas", "reprovar"] as const

export const esquemaAvaliacao = z.object({
  parecer: texto(5000),
  recomendacao: z.enum(RECOMENDACOES).nullable(),
})

export const esquemaAtribuicao = z.object({
  avaliadorIds: z.array(z.uuid()).min(1, "Selecione pelo menos um avaliador.").max(5),
  prazo: data,
})

export const esquemaLiberacao = z.object({
  justificativa: texto(300).min(5, "Escreva a justificativa."),
})
