import { useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { BOTAO_CONTORNO, CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_SUBMISSAO } from "../../consts/artigos"
import { formatarData } from "../../helpers/formatar"
import { estiloInput } from "../../helpers/estilos"
import { Linha, Selo, Tabela } from "../painel/Elementos"
import type { ResumoSubmissao, StatusSubmissao } from "../../types/artigos"

type Ordem = "recentes" | "antigos" | "titulo"

interface Props {
  titulo: string
  artigos: ResumoSubmissao[]
  // Para onde vai o botão da linha (o rascunho do autor abre a edição)
  link: (artigo: ResumoSubmissao) => { to: string; label: string }
  acaoTopo?: ReactNode
  // Itens por página; sem isso mostra tudo
  porPagina?: number
}

const dataDoArtigo = (a: ResumoSubmissao) => a.submetidoEm ?? a.criadoEm
const GRADE = "lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_8rem_10rem_9rem]"

// Lista com busca, filtro de situação e ordenação (autor e admin)
export default function ListaSubmissoes({ titulo, artigos, link, acaoTopo, porPagina }: Props) {
  const [busca, setBusca] = useState("")
  const [situacao, setSituacao] = useState<StatusSubmissao | "">("")
  const [ordem, setOrdem] = useState<Ordem>("recentes")
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = artigos.filter(
      (a) =>
        (!situacao || a.status === situacao) &&
        (!termo || a.titulo.toLowerCase().includes(termo) || a.autores.some((n) => n.toLowerCase().includes(termo)))
    )
    return lista.sort((a, b) =>
      ordem === "titulo"
        ? a.titulo.localeCompare(b.titulo, "pt-BR")
        : (ordem === "recentes" ? -1 : 1) * dataDoArtigo(a).localeCompare(dataDoArtigo(b))
    )
  }, [artigos, busca, situacao, ordem])

  const paginas = porPagina ? Math.max(1, Math.ceil(filtrados.length / porPagina)) : 1
  const atual = Math.min(pagina, paginas)
  const visiveis = porPagina ? filtrados.slice((atual - 1) * porPagina, atual * porPagina) : filtrados
  const situacoes = [...new Set(artigos.map((a) => a.status))]

  return (
    <>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_14rem_14rem]">
        <label className="relative">
          <span className="sr-only">Buscar por título ou autor</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eco-gray" />
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(1)
            }}
            placeholder="Buscar por título ou autor"
            className={`${estiloInput} bg-white pl-9`}
          />
        </label>
        <select
          aria-label="Situação"
          value={situacao}
          onChange={(e) => {
            setSituacao(e.target.value as StatusSubmissao | "")
            setPagina(1)
          }}
          className={`${estiloInput} bg-white`}
        >
          <option value="">Situação: Todas</option>
          {situacoes.map((s) => (
            <option key={s} value={s}>
              Situação: {STATUS_SUBMISSAO[s].rotulo}
            </option>
          ))}
        </select>
        <select
          aria-label="Ordenar"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordem)}
          className={`${estiloInput} bg-white`}
        >
          <option value="recentes">Ordenar: Mais recentes</option>
          <option value="antigos">Ordenar: Mais antigos</option>
          <option value="titulo">Ordenar: Título (A–Z)</option>
        </select>
      </div>

      <div className={CARTAO_PAINEL}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-sora text-xl font-bold text-eco-blue">{titulo}</h2>
            <Selo cor="bg-slate-100 text-slate-600">
              {filtrados.length} {filtrados.length === 1 ? "exibido" : "exibidos"}
            </Selo>
          </div>
          {acaoTopo}
        </div>

        {visiveis.length ? (
          <Tabela colunas={["Título", "Autores", "Data de submissão", "Situação", ""]} grade={GRADE}>
            {visiveis.map((a) => {
              const destino = link(a)
              return (
                <Linha key={a.id} grade={GRADE}>
                  <span className="font-inter font-semibold text-eco-blue">{a.titulo}</span>
                  <span className="font-inter text-sm text-eco-gray">{a.autores.join(", ")}</span>
                  <span className="font-inter text-sm text-eco-gray">{a.submetidoEm ? formatarData(a.submetidoEm) : "—"}</span>
                  <span>
                    <Selo cor={STATUS_SUBMISSAO[a.status].cor}>{STATUS_SUBMISSAO[a.status].rotulo}</Selo>
                  </span>
                  <Link to={destino.to} className={`${BOTAO_CONTORNO} lg:justify-self-end`}>
                    {destino.label}
                  </Link>
                </Linha>
              )
            })}
          </Tabela>
        ) : (
          <p className="font-inter py-10 text-center text-eco-gray">Nenhum artigo encontrado com esses filtros.</p>
        )}
      </div>

      {porPagina && filtrados.length > porPagina && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-inter text-sm text-eco-gray">
            Mostrando {visiveis.length} de {filtrados.length} artigos
          </p>
          <nav aria-label="Páginas" className="flex flex-wrap gap-2">
            <BotaoPagina disabled={atual === 1} onClick={() => setPagina(atual - 1)}>
              ‹ Anterior
            </BotaoPagina>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
              <BotaoPagina key={n} ativo={n === atual} onClick={() => setPagina(n)}>
                {n}
              </BotaoPagina>
            ))}
            <BotaoPagina disabled={atual === paginas} onClick={() => setPagina(atual + 1)}>
              Próxima ›
            </BotaoPagina>
          </nav>
        </div>
      )}
    </>
  )
}

function BotaoPagina({
  ativo,
  disabled,
  onClick,
  children,
}: {
  ativo?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-current={ativo ? "page" : undefined}
      className={`font-inter min-w-10 cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
        ativo ? "border-eco-blue bg-eco-blue text-white" : "border-eco-blue/10 bg-white text-eco-blue"
      }`}
    >
      {children}
    </button>
  )
}
