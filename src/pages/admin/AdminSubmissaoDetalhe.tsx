import { useCallback, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useCarregar } from "../../hooks/useCarregar"
import { obterSubmissao } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Carregando, Rotulo, Selo } from "../../components/painel/Elementos"
import DetalheArtigo from "../../components/artigos/DetalheArtigo"
import ModalAtribuir from "../../components/artigos/ModalAtribuir"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_ATRIBUICAO, recomendacao } from "../../consts/artigos"
import { formatarData } from "../../helpers/formatar"

export default function AdminSubmissaoDetalhe() {
  const { id = "" } = useParams()
  const { dados: artigo, erro, recarregar } = useCarregar(useCallback(() => obterSubmissao(id), [id]))
  const [atribuindo, setAtribuindo] = useState(false)

  const atribuicoes = artigo?.atribuicoes ?? []
  const cartaoAvaliacao = artigo && (
    <div className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
      <h2 className="font-sora text-xl font-bold text-eco-blue">{atribuicoes.length > 1 ? "Avaliações" : "Avaliação"}</h2>
      {!atribuicoes.length && <p className="font-inter text-sm text-eco-gray">Nenhum avaliador designado ainda.</p>}
      {atribuicoes.map((a) => (
        <div key={a.id} className="flex flex-col gap-3 border-b border-eco-blue/10 pb-4 last:border-0 last:pb-0">
          <div>
            <Rotulo>Avaliador</Rotulo>
            <p className="font-inter text-eco-blue">{a.avaliador}</p>
          </div>
          <div>
            <Rotulo>Prazo</Rotulo>
            <p className="font-inter text-eco-blue">{formatarData(a.prazo)}</p>
          </div>
          <div>
            <Rotulo>Parecer</Rotulo>
            <div className="mt-1 flex flex-wrap gap-2">
              {a.status === "enviada" && a.recomendacao ? (
                <Selo cor={recomendacao(a.recomendacao).cor}>{recomendacao(a.recomendacao).rotulo}</Selo>
              ) : (
                <Selo cor="bg-slate-100 text-slate-600">
                  {a.status === "edicao_liberada" ? STATUS_ATRIBUICAO.edicao_liberada.rotulo : "Aguardando envio"}
                </Selo>
              )}
            </div>
            {a.status === "enviada" && a.parecer && (
              <p className="font-inter mt-2 whitespace-pre-line text-sm text-eco-gray">{a.parecer}</p>
            )}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setAtribuindo(true)} className={`${BOTAO_LARANJA} w-full`}>
        {atribuicoes.length ? "Reatribuir avaliador" : "Atribuir avaliador"}
      </button>
      {atribuicoes.length > 0 && (
        <Link to="/admin/avaliacoes" className={`${BOTAO_CONTORNO} w-full`}>
          Ver avaliações
        </Link>
      )}
    </div>
  )

  return (
    <>
      <CabecalhoPainel
        voltar={{ to: "/admin/submissoes", label: "Submissões" }}
        titulo="Detalhes do artigo"
        subtitulo={artigo?.submetidoEm ? `Submetido em ${formatarData(artigo.submetidoEm)}` : undefined}
      />
      <MensagemErro>{erro}</MensagemErro>
      {!artigo && !erro && <Carregando />}
      {artigo && <DetalheArtigo artigo={artigo} lateral={cartaoAvaliacao} />}

      <ModalAtribuir
        artigo={atribuindo && artigo ? artigo : null}
        selecionados={atribuicoes.map((a) => a.avaliadorId)}
        prazo={atribuicoes[0]?.prazo}
        onFechar={() => setAtribuindo(false)}
        onAtribuido={recarregar}
      />
    </>
  )
}
