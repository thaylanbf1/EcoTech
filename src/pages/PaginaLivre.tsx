import { Link, useParams } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useSite } from "../hooks/useSite"
import { useAuth } from "../hooks/useAuth"
import { PREFIXO_PAGINA_LIVRE, conteudoVazio, templateDoItem } from "../consts/site"
import type { ConteudoPagina, TemplateLivre } from "../types/site"

// Parágrafos separados por linha em branco
function Paragrafos({ texto, className = "" }: { texto: string; className?: string }) {
  const paragrafos = texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className={`font-sora flex flex-col gap-4 text-lg text-eco-gray ${className}`}>
      {paragrafos.map((p, i) => (
        <p key={i} className="whitespace-pre-line">{p}</p>
      ))}
    </div>
  )
}

// Corpo de uma página livre, no template escolhido pelo admin
export function ConteudoLivre({ template, rotulo, conteudo }: { template: TemplateLivre; rotulo: string; conteudo: ConteudoPagina }) {
  const titulo = conteudo.titulo || rotulo
  const blocos = conteudo.blocos.filter((b) => b.titulo || b.descricao || b.imagem)

  if (template === "texto") {
    return (
      <div className={`mx-auto grid max-w-6xl gap-12 ${conteudo.imagem ? "lg:grid-cols-2 lg:items-center" : "max-w-3xl"}`}>
        <div>
          <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">{titulo}</h1>
          <Paragrafos texto={conteudo.texto} className="mt-6" />
        </div>
        {conteudo.imagem && <img src={conteudo.imagem} alt="" className="w-full rounded-3xl border-2 border-eco-blue object-cover" />}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">{titulo}</h1>
        {conteudo.texto && <Paragrafos texto={conteudo.texto} className="mt-6" />}
      </div>

      {template === "cartoes" && (
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blocos.map((b, i) => (
            <article key={i} className="overflow-hidden rounded-3xl border-2 border-eco-blue bg-white">
              {b.imagem && <img src={b.imagem} alt="" className="h-56 w-full object-cover" />}
              <div className="p-8">
                {b.titulo && <h2 className="font-sora text-xl font-bold text-eco-blue">{b.titulo}</h2>}
                {b.descricao && <p className="font-sora mt-3 whitespace-pre-line text-eco-gray">{b.descricao}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {template === "perguntas" && (
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {blocos.map((b, i) => (
            <details key={i} className="group rounded-2xl border-2 border-eco-blue bg-white px-6 py-4">
              <summary className="font-sora flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-eco-blue">
                {b.titulo}
                <ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="font-sora mt-3 whitespace-pre-line text-eco-gray">{b.descricao}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PaginaLivre() {
  const { slug = "" } = useParams()
  const { site } = useSite()
  const { usuario } = useAuth()
  const item = site.menu.find((i) => i.to === `${PREFIXO_PAGINA_LIVRE}${slug}`)
  const t = item && templateDoItem(item)
  // Só os templates que viram página aqui (o "link" leva para fora)
  const template = t === "texto" || t === "cartoes" || t === "perguntas" ? t : null
  // Item oculto ainda não foi publicado: só o admin vê
  const publicada = item && (item.visivel || usuario?.perfil === "admin")

  if (!item || !publicada || !template) {
    return (
      <section className="min-h-[70vh] bg-eco-cream px-6 py-24 text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue">Página não encontrada</h1>
        <p className="font-sora mt-4 text-eco-gray">Esta página não existe ou foi retirada do site.</p>
        <Link to="/" className="font-sora mt-8 inline-block font-bold text-eco-blue underline">Voltar ao início</Link>
      </section>
    )
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      {!item.visivel && (
        <p className="font-sora mx-auto mb-10 max-w-3xl rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Página oculta: só administradores conseguem vê-la. Marque como visível no menu para publicar.
        </p>
      )}
      <ConteudoLivre template={template} rotulo={item.rotulo} conteudo={item.conteudo ?? conteudoVazio()} />
    </section>
  )
}
