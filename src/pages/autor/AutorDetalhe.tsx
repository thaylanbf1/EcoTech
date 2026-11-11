import { useCallback } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useCarregar } from "../../hooks/useCarregar"
import { obterMinhaSubmissao } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Carregando, Selo } from "../../components/painel/Elementos"
import DetalheArtigo from "../../components/artigos/DetalheArtigo"
import { MensagemErro } from "../../components/form"
import { CARTAO_PAINEL } from "../../consts/estilos"
import { recomendacao } from "../../consts/artigos"
import { formatarData } from "../../helpers/formatar"
import type { Submissao } from "../../types/artigos"

// Pareceres dos avaliadores, numerados (o autor não sabe quem avaliou)
function Pareceres({ artigo }: { artigo: Submissao }) {
  const pareceres = artigo.pareceres ?? []
  return (
    <div className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
      <h2 className="font-sora text-xl font-bold text-eco-blue">Parecer da avaliação</h2>
      {!pareceres.length && (
        <p className="font-inter text-sm text-eco-gray">O parecer aparece aqui quando a avaliação terminar.</p>
      )}
      {pareceres.map((p, i) => (
        <div key={i} className="flex flex-col gap-2 border-b border-eco-blue/10 pb-4 last:border-0 last:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-inter text-sm font-semibold text-eco-blue">
              {pareceres.length > 1 ? `Avaliador ${i + 1}` : "Avaliador"}
            </span>
            <Selo cor={recomendacao(p.recomendacao).cor}>{recomendacao(p.recomendacao).rotulo}</Selo>
          </div>
          <p className="font-inter whitespace-pre-line text-sm text-eco-gray">{p.parecer}</p>
        </div>
      ))}
    </div>
  )
}

export default function AutorDetalhe() {
  const { id = "" } = useParams()
  const { dados: artigo, erro } = useCarregar(useCallback(() => obterMinhaSubmissao(id), [id]))

  // Rascunho ainda pode mudar: abre direto na edição
  if (artigo?.status === "rascunho") return <Navigate to={`/autor/submissoes/${id}/editar`} replace />

  return (
    <>
      <CabecalhoPainel
        voltar={{ to: "/autor/submissoes", label: "Minhas submissões" }}
        titulo="Detalhes do artigo"
        subtitulo={artigo?.submetidoEm ? `Submetido em ${formatarData(artigo.submetidoEm)}` : undefined}
      />
      <MensagemErro>{erro}</MensagemErro>
      {!artigo && !erro && <Carregando />}
      {artigo && <DetalheArtigo artigo={artigo} lateral={<Pareceres artigo={artigo} />} />}
    </>
  )
}
