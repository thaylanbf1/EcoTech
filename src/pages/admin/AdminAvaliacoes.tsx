import { useState } from "react"
import { Info } from "lucide-react"
import { useCarregar } from "../../hooks/useCarregar"
import { liberarEdicao, listarAvaliacoes } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando, Linha, Rotulo, Selo, Tabela } from "../../components/painel/Elementos"
import Modal from "../../components/Modal"
import { Campo, MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_ATRIBUICAO, recomendacao } from "../../consts/artigos"
import { formatarData, formatarDataHora } from "../../helpers/formatar"
import type { Atribuicao } from "../../types/artigos"

const GRADE = "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_11rem_10rem_9rem]"

// Pareceres de todos os artigos e a liberação de avaliações já enviadas
export default function AdminAvaliacoes() {
  const { dados: avaliacoes, erro, recarregar } = useCarregar(listarAvaliacoes)
  const [liberando, setLiberando] = useState<Atribuicao | null>(null)
  const [vendo, setVendo] = useState<Atribuicao | null>(null)
  const [justificativa, setJustificativa] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erroModal, setErroModal] = useState("")

  const abrirLiberar = (a: Atribuicao) => {
    setLiberando(a)
    setJustificativa(a.alteracaoSolicitadaEm ? "Correção solicitada pelo avaliador." : "")
    setErroModal("")
  }

  const liberar = async () => {
    if (!liberando) return
    setSalvando(true)
    setErroModal("")
    try {
      await liberarEdicao(liberando.id, justificativa)
      setLiberando(null)
      recarregar()
    } catch (e) {
      setErroModal(e instanceof Error ? e.message : "Não foi possível liberar.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <CabecalhoPainel titulo="Avaliações" subtitulo="Acompanhe os pareceres e controle a alteração de avaliações enviadas." />
      <div className="mb-5">
        <Aviso>Avaliações enviadas ficam bloqueadas. Somente o administrador pode autorizar a alteração.</Aviso>
      </div>
      <MensagemErro>{erro}</MensagemErro>

      <div className={CARTAO_PAINEL}>
        <h2 className="font-sora text-xl font-bold text-eco-blue">Avaliações dos artigos</h2>
        {!avaliacoes && !erro && <Carregando />}
        {avaliacoes && !avaliacoes.length && (
          <p className="font-inter py-8 text-center text-eco-gray">Nenhum artigo tem avaliador designado ainda.</p>
        )}
        {avaliacoes && avaliacoes.length > 0 && (
          <Tabela colunas={["Artigo", "Avaliador", "Recomendação", "Status", ""]} grade={GRADE}>
            {avaliacoes.map((a) => {
              const emAndamento = a.status === "pendente" || a.status === "rascunho"
              return (
                <Linha key={a.id} grade={GRADE}>
                  <span className="font-inter font-semibold text-eco-blue">{a.titulo}</span>
                  <span className="font-inter text-sm text-eco-gray">{a.avaliador}</span>
                  <span>
                    {a.recomendacao && !emAndamento && (
                      <Selo cor={recomendacao(a.recomendacao).cor}>{recomendacao(a.recomendacao).rotulo}</Selo>
                    )}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    <Selo cor={emAndamento ? "bg-slate-100 text-slate-600" : STATUS_ATRIBUICAO[a.status].cor}>
                      {emAndamento ? "Em andamento" : STATUS_ATRIBUICAO[a.status].rotulo}
                    </Selo>
                    {a.alteracaoSolicitadaEm && <Selo cor="bg-eco-orange-soft text-orange-700">Pediu alteração</Selo>}
                  </span>
                  <span className="flex flex-wrap gap-2 lg:justify-self-end">
                    {a.status === "enviada" && (
                      <button type="button" onClick={() => abrirLiberar(a)} className={BOTAO_CONTORNO}>
                        Liberar edição
                      </button>
                    )}
                    {a.status !== "pendente" && (
                      <button type="button" onClick={() => setVendo(a)} className={BOTAO_CONTORNO}>
                        Ver
                      </button>
                    )}
                  </span>
                </Linha>
              )
            })}
          </Tabela>
        )}
      </div>

      <Modal aberto={!!liberando} titulo="Autorizar alteração da avaliação?" onFechar={() => setLiberando(null)}>
        {liberando && (
          <div className="flex flex-col gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-eco-blue-soft text-eco-blue">
              <Info size={22} />
            </span>
            <p className="font-inter text-eco-gray">
              {liberando.avaliador} poderá editar a avaliação já enviada do artigo “{liberando.titulo}”. Ela volta a
              ficar bloqueada quando for reenviada.
            </p>
            {liberando.alteracaoSolicitadaEm && (
              <p className="font-inter text-sm text-orange-700">
                O avaliador pediu a alteração em {formatarDataHora(liberando.alteracaoSolicitadaEm)}.
              </p>
            )}
            <Campo
              label="Justificativa (registrada no histórico)"
              required
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
            <MensagemErro>{erroModal}</MensagemErro>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setLiberando(null)} className={BOTAO_CONTORNO}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={liberar}
                disabled={salvando || justificativa.trim().length < 5}
                className={BOTAO_LARANJA}
              >
                {salvando ? "Liberando..." : "Autorizar alteração"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={!!vendo} titulo="Avaliação" onFechar={() => setVendo(null)}>
        {vendo && (
          <div className="flex flex-col gap-4">
            <div>
              <Rotulo>Artigo</Rotulo>
              <p className="font-inter text-eco-blue">{vendo.titulo}</p>
            </div>
            <div>
              <Rotulo>Avaliador · prazo</Rotulo>
              <p className="font-inter text-eco-blue">
                {vendo.avaliador} · {formatarData(vendo.prazo)}
              </p>
            </div>
            {vendo.recomendacao && (
              <div>
                <Rotulo>Recomendação</Rotulo>
                <div className="mt-1">
                  <Selo cor={recomendacao(vendo.recomendacao).cor}>{recomendacao(vendo.recomendacao).rotulo}</Selo>
                </div>
              </div>
            )}
            <div>
              <Rotulo>Parecer</Rotulo>
              <p className="font-inter mt-1 whitespace-pre-line text-eco-blue">{vendo.parecer || "—"}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
