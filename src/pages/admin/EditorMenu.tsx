import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Trash2 } from "lucide-react"
import { BOTAO_SECUNDARIO } from "../../consts/estilos"
import {
  PREFIXO_PAGINA_LIVRE,
  TEMPLATES_PRONTOS,
  conteudoEmBranco,
  conteudoVazio,
  nomeTemplate,
  slugDe,
  templateDoItem,
  templateLivre,
} from "../../consts/site"
import { Campo } from "../../components/form"
import SeletorImagem from "./SeletorImagem"
import GaleriaTemplates from "./GaleriaTemplates"
import PreviaTemplate from "./PreviaTemplate"
import PreviaEscalada from "../../components/PreviaEscalada"
import type { BlocoPagina, ConteudoPagina, ItemMenu, TemplatePagina } from "../../types/site"

interface Props {
  menu: ItemMenu[]
  onChange: (menu: ItemMenu[]) => void
  onErro: (mensagem: string) => void
}

// Onde o admin edita o conteúdo de cada página pronta
const ONDE_EDITAR: Partial<Record<TemplatePagina, { to: string; label: string }>> = {
  inicio: { to: "/admin/evento", label: "Conteúdo da página, no topo desta tela" },
  sobre: { to: "/admin/sobre", label: "Página Sobre" },
  parceiros: { to: "/admin/sobre", label: "Página Sobre" },
  patrocinadores: { to: "/admin/sobre", label: "Página Sobre" },
  cronograma: { to: "/admin/atividades", label: "Atividades" },
  inscricao: { to: "/admin/dados-evento", label: "Dados do evento" },
}

const ESTILO_INPUT = "font-sora w-full rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm text-eco-blue outline-none focus:border-eco-blue"

let contador = 0
const novoId = (prefixo: string) => `${prefixo}-${Math.random().toString(36).slice(2, 8)}${(contador++).toString(36)}`

// Rota de página livre que ainda não está em uso por outro item
function rotaLivre(rotulo: string, menu: ItemMenu[], idDoItem: string): string {
  const ocupadas = new Set(menu.filter((i) => i.id !== idDoItem).map((i) => i.to))
  const base = `${PREFIXO_PAGINA_LIVRE}${slugDe(rotulo)}`
  let rota = base
  for (let n = 2; ocupadas.has(rota); n++) rota = `${base}-${n}`
  return rota
}

function mover<T>(lista: T[], i: number, d: -1 | 1): T[] {
  const nova = [...lista]
  ;[nova[i], nova[i + d]] = [nova[i + d], nova[i]]
  return nova
}

function Setas({ i, total, nome, onMover }: { i: number; total: number; nome: string; onMover: (d: -1 | 1) => void }) {
  return (
    <div className="flex flex-col">
      <button type="button" aria-label={`Subir ${nome}`} disabled={i === 0} onClick={() => onMover(-1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowUp size={14} /></button>
      <button type="button" aria-label={`Descer ${nome}`} disabled={i === total - 1} onClick={() => onMover(1)} className="cursor-pointer text-eco-gray disabled:opacity-30"><ArrowDown size={14} /></button>
    </div>
  )
}

function AreaTexto({ label, valor, onChange, ajuda, linhas = 4, max }: {
  label: string; valor: string; onChange: (v: string) => void; ajuda?: string; linhas?: number; max: number
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sora text-xs font-bold text-eco-blue">{label}</span>
      <textarea rows={linhas} maxLength={max} value={valor} onChange={(e) => onChange(e.target.value)} className={ESTILO_INPUT} />
      {ajuda && <span className="font-sora text-[11px] text-eco-gray">{ajuda}</span>}
    </label>
  )
}

// Cartões ou perguntas de uma página livre
function EditorBlocos({ tipo, blocos, onChange, onErro }: {
  tipo: "cartoes" | "perguntas"; blocos: BlocoPagina[]; onChange: (b: BlocoPagina[]) => void; onErro: (m: string) => void
}) {
  const cartao = tipo === "cartoes"
  const nome = cartao ? "cartão" : "pergunta"
  const alterar = (i: number, p: Partial<BlocoPagina>) => onChange(blocos.map((b, j) => (j === i ? { ...b, ...p } : b)))
  return (
    <div className="flex flex-col gap-2">
      <p className="font-sora text-xs font-bold text-eco-blue">{cartao ? "Cartões" : "Perguntas"}</p>
      {blocos.map((b, i) => (
        <div key={i} className="flex gap-2 rounded-xl border border-eco-blue/10 bg-white p-3">
          <Setas i={i} total={blocos.length} nome={`${nome} ${i + 1}`} onMover={(d) => onChange(mover(blocos, i, d))} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input aria-label={cartao ? `Título do cartão ${i + 1}` : `Pergunta ${i + 1}`} placeholder={cartao ? "Título do cartão" : "Pergunta"} maxLength={120} value={b.titulo} onChange={(e) => alterar(i, { titulo: e.target.value })} className={`${ESTILO_INPUT} font-bold`} />
            <textarea aria-label={cartao ? `Texto do cartão ${i + 1}` : `Resposta ${i + 1}`} placeholder={cartao ? "Texto do cartão" : "Resposta"} rows={3} maxLength={1500} value={b.descricao} onChange={(e) => alterar(i, { descricao: e.target.value })} className={ESTILO_INPUT} />
            {cartao && <SeletorImagem rotulo="Imagem do cartão" vazio="Sem imagem" valor={b.imagem} maxLado={800} onChange={(v) => alterar(i, { imagem: v })} onErro={onErro} />}
          </div>
          <button type="button" aria-label={`Remover ${nome} ${i + 1}`} onClick={() => onChange(blocos.filter((_, j) => j !== i))} className="cursor-pointer self-start p-1 text-red-700"><Trash2 size={16} /></button>
        </div>
      ))}
      {blocos.length < 30 && (
        <button type="button" onClick={() => onChange([...blocos, { titulo: "", descricao: "", imagem: "" }])} className={`${BOTAO_SECUNDARIO} self-start`}>
          + Adicionar {nome}
        </button>
      )}
    </div>
  )
}

// O que aparece ao abrir um item: o conteúdo do template escolhido
function EditorConteudo({ item, template, onConteudo, onErro }: {
  item: ItemMenu; template: TemplatePagina; onConteudo: (c: ConteudoPagina) => void; onErro: (m: string) => void
}) {
  const conteudo = item.conteudo ?? conteudoVazio()
  const alterar = (p: Partial<ConteudoPagina>) => onConteudo({ ...conteudo, ...p })

  if (!templateLivre(template)) {
    const pronto = TEMPLATES_PRONTOS.find((t) => t.id === template)
    const onde = ONDE_EDITAR[template]
    return (
      <p className="font-sora text-sm text-eco-gray">
        Página pronta: {pronto?.descricao}{" "}
        {onde ? (
          <>O conteúdo é editado em <Link to={onde.to} className="font-bold text-eco-blue underline">{onde.label}</Link>.</>
        ) : (
          "O conteúdo vem do próprio site."
        )}
      </p>
    )
  }

  if (template === "link") {
    return (
      <Campo
        label="Endereço do link"
        type="url"
        required
        placeholder="https://"
        value={conteudo.url}
        onChange={(e) => alterar({ url: e.target.value })}
        ajuda="O item do menu abre este endereço em uma nova aba."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Campo label="Título da página" maxLength={150} placeholder={item.rotulo} value={conteudo.titulo} onChange={(e) => alterar({ titulo: e.target.value })} ajuda="Em branco, usa o nome do item do menu." />
      <AreaTexto
        label={template === "texto" ? "Texto" : "Introdução"}
        linhas={template === "texto" ? 8 : 3}
        max={5000}
        valor={conteudo.texto}
        onChange={(v) => alterar({ texto: v })}
        ajuda="Deixe uma linha em branco entre os parágrafos."
      />
      {template === "texto" && (
        <SeletorImagem rotulo="Imagem ao lado do texto" vazio="Sem imagem" valor={conteudo.imagem} maxLado={1200} onChange={(v) => alterar({ imagem: v })} onErro={onErro} />
      )}
      {(template === "cartoes" || template === "perguntas") && (
        <EditorBlocos tipo={template} blocos={conteudo.blocos} onChange={(b) => alterar({ blocos: b })} onErro={onErro} />
      )}
    </div>
  )
}

export default function EditorMenu({ menu, onChange, onErro }: Props) {
  const [aberto, setAberto] = useState<string | null>(null)
  // Galeria de templates: para um item novo ou para trocar o de um item
  const [galeria, setGaleria] = useState<{ itemId?: string } | null>(null)

  const alterarItem = (id: string, novo: (item: ItemMenu) => ItemMenu) =>
    onChange(menu.map((item) => (item.id === id ? novo(item) : item)))

  // Templates prontos já usados por outro item (cada um só uma vez)
  const prontosEmUso = (exceto?: string) =>
    new Set(menu.filter((i) => i.id !== exceto).map(templateDoItem).filter((t) => !templateLivre(t)))

  const comTemplate = (item: ItemMenu, template: TemplatePagina, lista = menu): ItemMenu => {
    if (template === "link") {
      const conteudo = item.conteudo ?? conteudoVazio()
      return { ...item, template, conteudo, to: conteudo.url.trim() }
    }
    if (templateLivre(template)) {
      return { ...item, template, conteudo: item.conteudo ?? conteudoVazio(), to: rotaLivre(item.rotulo, lista, item.id) }
    }
    // Página pronta não guarda conteúdo próprio
    return { id: item.id, rotulo: item.rotulo, visivel: item.visivel, template, to: TEMPLATES_PRONTOS.find((t) => t.id === template)!.to }
  }

  const renomear = (item: ItemMenu, rotulo: string): ItemMenu => {
    const t = templateDoItem(item)
    // A rota das páginas livres acompanha o nome
    return templateLivre(t) && t !== "link" ? { ...item, rotulo, to: rotaLivre(rotulo, menu, item.id) } : { ...item, rotulo }
  }

  const adicionar = (template: TemplatePagina) => {
    const pronto = TEMPLATES_PRONTOS.find((t) => t.id === template)
    const id = novoId(template)
    const base: ItemMenu = { id, rotulo: pronto?.nome ?? "Nova página", to: "", visivel: true }
    onChange([...menu, comTemplate(base, template)])
    setAberto(id)
  }

  const itemDaGaleria = galeria?.itemId ? menu.find((i) => i.id === galeria.itemId) : undefined
  const escolherNaGaleria = (template: TemplatePagina) => {
    if (itemDaGaleria) alterarItem(itemDaGaleria.id, (it) => comTemplate(it, template))
    else adicionar(template)
    setGaleria(null)
  }

  return (
    <>
      {menu.map((item, i) => {
        const template = templateDoItem(item)
        const livre = templateLivre(template)
        const estaAberto = aberto === item.id
        return (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-eco-field p-2">
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <Setas i={i} total={menu.length} nome={item.rotulo} onMover={(d) => onChange(mover(menu, i, d))} />
              <input
                aria-label={`Nome do item ${i + 1}`}
                maxLength={30}
                value={item.rotulo}
                onChange={(e) => alterarItem(item.id, (it) => renomear(it, e.target.value))}
                className={`font-sora min-w-0 flex-1 rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-sm text-eco-blue ${item.visivel ? "" : "opacity-50"}`}
              />
              <button
                type="button"
                aria-label={`Template de ${item.rotulo}: ${nomeTemplate(template)}. Trocar`}
                disabled={template === "inicio"}
                onClick={() => setGaleria({ itemId: item.id })}
                className="font-sora flex w-40 shrink-0 cursor-pointer items-center justify-between gap-1 rounded-lg border border-eco-blue/15 bg-white px-3 py-2 text-left text-xs font-bold text-eco-blue hover:border-eco-blue disabled:cursor-default disabled:opacity-70 disabled:hover:border-eco-blue/15"
              >
                <span className="truncate">{nomeTemplate(template)}</span>
                {template !== "inicio" && <ChevronDown size={14} className="shrink-0" />}
              </button>
              <label className="font-sora flex cursor-pointer items-center gap-2 text-xs font-bold text-eco-blue">
                <input type="checkbox" role="switch" checked={item.visivel} onChange={(e) => alterarItem(item.id, (it) => ({ ...it, visivel: e.target.checked }))} />
                {item.visivel ? "Visível" : "Oculto"}
              </label>
              <button
                type="button"
                aria-expanded={estaAberto}
                aria-label={`${livre ? "Editar conteúdo de" : "Detalhes de"} ${item.rotulo}`}
                onClick={() => setAberto(estaAberto ? null : item.id)}
                className="font-sora flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-eco-blue hover:bg-eco-blue-soft"
              >
                {livre ? "Conteúdo" : "Detalhes"}
                <ChevronDown size={14} className={`transition-transform ${estaAberto ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                aria-label={`Remover ${item.rotulo}`}
                disabled={template === "inicio"}
                onClick={() => onChange(menu.filter((x) => x.id !== item.id))}
                className="cursor-pointer p-1 text-red-700 disabled:cursor-default disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {estaAberto && (
              <div className="flex flex-col gap-3 rounded-lg bg-eco-cream-light p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-sora text-xs font-bold uppercase tracking-wider text-eco-gray">
                    Template: {nomeTemplate(template)}
                  </p>
                  {template !== "link" && (
                    <a href={item.to} target="_blank" rel="noopener noreferrer" className="font-sora flex items-center gap-1 text-xs font-bold text-eco-blue underline">
                      Ver página <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <EditorConteudo
                  item={item}
                  template={template}
                  onConteudo={(c) => alterarItem(item.id, (it) => (template === "link" ? { ...it, conteudo: c, to: c.url.trim() } : { ...it, conteudo: c }))}
                  onErro={onErro}
                />
                {livre && template !== "link" && (
                  <p className="font-sora text-[11px] text-eco-gray">
                    Endereço: {item.to}. A página aparece no site depois de salvar.
                  </p>
                )}
                <div className="flex flex-col gap-2 border-t border-eco-blue/10 pt-3">
                  <p className="font-sora text-xs font-bold text-eco-blue">Pré-visualização</p>
                  {template === "inicio" ? (
                    <p className="font-sora text-xs text-eco-gray">A prévia da página inicial fica ao lado, em Pré-visualização.</p>
                  ) : (
                    <>
                      <PreviaEscalada altura={760}>
                        <PreviaTemplate template={template} rotulo={item.rotulo} conteudo={item.conteudo} />
                      </PreviaEscalada>
                      {livre && template !== "link" && conteudoEmBranco(item.conteudo) && (
                        <p className="font-sora text-[11px] text-eco-gray">Conteúdo de exemplo: preencha os campos acima para ver a sua página.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button type="button" onClick={() => setGaleria({})} className={`${BOTAO_SECUNDARIO} self-start`}>
        + Adicionar item
      </button>

      <GaleriaTemplates
        aberto={!!galeria}
        titulo={itemDaGaleria ? `Template de "${itemDaGaleria.rotulo}"` : "Escolha o template do novo item"}
        atual={itemDaGaleria && templateDoItem(itemDaGaleria)}
        emUso={prontosEmUso(itemDaGaleria?.id)}
        onEscolher={escolherNaGaleria}
        onFechar={() => setGaleria(null)}
      />
    </>
  )
}
