import type { ReactNode } from "react"
import { Check } from "lucide-react"
import { CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_SUBMISSAO } from "../../consts/artigos"
import { formatarData, iniciais } from "../../helpers/formatar"
import { Rotulo, Selo } from "../painel/Elementos"
import CaixaPdf from "./CaixaPdf"
import type { Submissao } from "../../types/artigos"

// Cartão principal do artigo + "Situação do artigo" ao lado.
// "lateral" recebe cartões extras da coluna direita (ex.: avaliação, no admin).
export default function DetalheArtigo({ artigo, lateral }: { artigo: Submissao; lateral?: ReactNode }) {
  const status = STATUS_SUBMISSAO[artigo.status]
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      <article className={`${CARTAO_PAINEL} flex flex-col gap-5`}>
        <div>
          <Selo cor={status.cor}>{status.rotulo}</Selo>
          <h2 className="font-sora mt-3 text-2xl font-extrabold text-eco-blue sm:text-3xl">{artigo.titulo}</h2>
        </div>

        <div>
          <Rotulo>Autores</Rotulo>
          <ul className="mt-2 flex flex-col gap-2">
            {artigo.autores.map((a) => (
              <li key={a.email} className="flex items-center gap-3 rounded-xl bg-eco-cream-light px-4 py-3">
                <span className="font-sora flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eco-blue-soft text-xs font-bold text-eco-blue">
                  {iniciais(a.nome)}
                </span>
                <div className="min-w-0">
                  <p className="font-inter font-semibold text-eco-blue">{a.nome}</p>
                  <p className="font-inter break-all text-sm text-eco-gray">
                    {[a.instituicao, a.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {artigo.submetidoEm && (
          <div>
            <Rotulo>Data de submissão</Rotulo>
            <p className="font-inter mt-1 text-eco-blue">{formatarData(artigo.submetidoEm)}</p>
          </div>
        )}

        <div>
          <Rotulo>Resumo</Rotulo>
          <p className="font-inter mt-1 whitespace-pre-line leading-relaxed text-eco-blue">{artigo.resumo || "—"}</p>
        </div>

        {artigo.palavrasChave.length > 0 && (
          <div>
            <Rotulo>Palavras-chave</Rotulo>
            <div className="mt-2 flex flex-wrap gap-2">
              {artigo.palavrasChave.map((p) => (
                <Selo key={p} cor="bg-eco-blue-soft text-eco-blue">
                  {p}
                </Selo>
              ))}
            </div>
          </div>
        )}

        <div>
          <Rotulo>Arquivo submetido</Rotulo>
          <div className="mt-2">
            {artigo.arquivo ? (
              <CaixaPdf submissaoId={artigo.id} arquivo={artigo.arquivo} />
            ) : (
              <p className="font-inter text-sm text-eco-gray">Nenhum PDF anexado ainda.</p>
            )}
          </div>
        </div>
      </article>

      <div className="flex flex-col gap-6">
        <LinhaDoTempo artigo={artigo} />
        {lateral}
      </div>
    </div>
  )
}

type Etapa = "feita" | "atual" | "futura"

function Passo({ etapa, titulo, children }: { etapa: Etapa; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          etapa === "feita" ? "bg-green-600 text-white" : etapa === "atual" ? "bg-eco-orange" : "border-2 border-slate-300"
        }`}
      >
        {etapa === "feita" && <Check size={14} strokeWidth={3} />}
      </span>
      <div>
        <p className={`font-inter font-semibold ${etapa === "futura" ? "text-eco-gray" : "text-eco-blue"}`}>{titulo}</p>
        <p className="font-inter text-sm text-eco-gray">{children}</p>
      </div>
    </li>
  )
}

// Submetido → Em avaliação → Resultado
function LinhaDoTempo({ artigo }: { artigo: Submissao }) {
  const s = artigo.status
  const temResultado = s === "aprovado" || s === "aprovado_ressalvas" || s === "reprovado"
  return (
    <div className={CARTAO_PAINEL}>
      <h2 className="font-sora text-xl font-bold text-eco-blue">Situação do artigo</h2>
      <ol className="mt-4 flex flex-col gap-4">
        <Passo etapa={s === "rascunho" ? "atual" : "feita"} titulo={s === "rascunho" ? "Rascunho" : "Submetido"}>
          {artigo.submetidoEm ? formatarData(artigo.submetidoEm) : "Ainda não enviado para avaliação"}
        </Passo>
        <Passo etapa={temResultado ? "feita" : s === "em_avaliacao" ? "atual" : "futura"} titulo="Em avaliação">
          {s === "submetido" ? "Aguardando o administrador designar um avaliador" : "Avaliador designado pelo administrador"}
        </Passo>
        <Passo etapa={temResultado ? "feita" : "futura"} titulo={temResultado ? STATUS_SUBMISSAO[s].rotulo : "Resultado"}>
          {temResultado ? "Avaliação concluída" : "Aprovado, aprovado com ressalvas ou reprovado"}
        </Passo>
      </ol>
    </div>
  )
}
