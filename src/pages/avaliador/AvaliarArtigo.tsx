import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Lock } from "lucide-react"
import { useCarregar } from "../../hooks/useCarregar"
import { enviarAvaliacao, obterTrabalho, salvarRascunhoAvaliacao, solicitarAlteracao } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando, Rotulo, Selo } from "../../components/painel/Elementos"
import CaixaPdf from "../../components/artigos/CaixaPdf"
import Modal from "../../components/Modal"
import { MensagemErro, MensagemSucesso } from "../../components/form"
import { AREA_TEXTO, BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { RECOMENDACOES, recomendacao as dadosRecomendacao } from "../../consts/artigos"
import { formatarData, formatarDataHora } from "../../helpers/formatar"
import type { Recomendacao } from "../../types/artigos"

const MIN_PARECER = 20

export default function AvaliarArtigo() {
  const { id = "" } = useParams()
  const { dados: trabalho, erro, setDados } = useCarregar(useCallback(() => obterTrabalho(id), [id]))
  const [parecer, setParecer] = useState("")
  const [escolha, setEscolha] = useState<Recomendacao | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  // Preenche o formulário quando o trabalho chega (ou volta do servidor)
  useEffect(() => {
    if (!trabalho) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- copia os dados carregados para o formulário
    setParecer(trabalho.parecer)
    setEscolha(trabalho.recomendacao)
  }, [trabalho])

  const bloqueada = trabalho?.status === "enviada"

  const executar = async (acao: () => Promise<void>) => {
    setOcupado(true)
    setMsg({ erro: "", ok: "" })
    try {
      await acao()
    } catch (e) {
      setMsg({ erro: e instanceof Error ? e.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setOcupado(false)
    }
  }

  const salvarRascunho = () =>
    executar(async () => {
      setDados(await salvarRascunhoAvaliacao(id, { parecer, recomendacao: escolha }))
      setMsg({ erro: "", ok: "Rascunho salvo." })
    })

  const enviar = () =>
    executar(async () => {
      setConfirmar(false)
      setDados(await enviarAvaliacao(id, { parecer, recomendacao: escolha }))
    })

  const pedirAutorizacao = () =>
    executar(async () => {
      setDados(await solicitarAlteracao(id))
      setMsg({ erro: "", ok: "Pedido enviado. O administrador vai analisar." })
    })

  const podeEnviar = parecer.trim().length >= MIN_PARECER && !!escolha

  return (
    <>
      <CabecalhoPainel
        voltar={{ to: "/avaliador/trabalhos", label: "Trabalhos atribuídos" }}
        titulo={bloqueada ? "Avaliação enviada" : "Avaliar artigo"}
        subtitulo={trabalho?.titulo}
      />
      <MensagemErro>{erro}</MensagemErro>
      {!trabalho && !erro && <Carregando />}

      {trabalho && (
        <>
          {bloqueada && (
            <div className="mb-6">
              <Aviso
                acao={
                  trabalho.alteracaoSolicitadaEm ? (
                    <Selo cor="bg-white text-eco-blue">
                      Autorização solicitada em {formatarDataHora(trabalho.alteracaoSolicitadaEm)}
                    </Selo>
                  ) : (
                    <button type="button" onClick={pedirAutorizacao} disabled={ocupado} className={BOTAO_CONTORNO}>
                      Solicitar autorização
                    </button>
                  )
                }
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Lock size={15} />
                  Avaliação enviada em {trabalho.enviadaEm ? formatarDataHora(trabalho.enviadaEm) : "—"} — bloqueada para edição
                </p>
                <p className="mt-0.5 text-xs text-eco-gray">
                  Para alterar o parecer ou a recomendação, é necessária a autorização do administrador.
                </p>
              </Aviso>
            </div>
          )}
          {trabalho.status === "edicao_liberada" && (
            <div className="mb-6">
              <Aviso>O administrador liberou a edição desta avaliação. Ao reenviar, ela volta a ficar bloqueada.</Aviso>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-start">
            <section className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-sora text-xl font-bold text-eco-blue">Artigo</h2>
                <Selo cor="bg-eco-orange-soft text-orange-700">Prazo: {formatarData(trabalho.prazo)}</Selo>
              </div>
              {trabalho.palavrasChave.length > 0 && (
                <div>
                  <Rotulo>Palavras-chave</Rotulo>
                  <p className="font-inter mt-1 text-eco-blue">{trabalho.palavrasChave.join(" · ")}</p>
                </div>
              )}
              <div>
                <Rotulo>Resumo</Rotulo>
                <p className="font-inter mt-1 whitespace-pre-line leading-relaxed text-eco-blue">{trabalho.resumo}</p>
              </div>
              {trabalho.arquivo && (
                <CaixaPdf submissaoId={trabalho.submissaoId} arquivo={trabalho.arquivo} rotulo="Abrir PDF" previa />
              )}
            </section>

            <section className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
              <h2 className="font-sora text-xl font-bold text-eco-blue">Sua avaliação</h2>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="parecer" className="font-inter text-sm font-semibold text-eco-blue">
                  Parecer
                </label>
                <textarea
                  id="parecer"
                  rows={7}
                  maxLength={5000}
                  value={parecer}
                  disabled={bloqueada}
                  onChange={(e) => setParecer(e.target.value)}
                  placeholder="Comente os pontos fortes, o que pode melhorar e o motivo da sua recomendação."
                  className={AREA_TEXTO}
                />
                {!bloqueada && (
                  <p className="font-inter text-xs text-eco-gray">Mínimo de {MIN_PARECER} caracteres para enviar.</p>
                )}
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="font-inter mb-2 text-sm font-semibold text-eco-blue">Recomendação</legend>
                {RECOMENDACOES.map((r) => {
                  const marcada = escolha === r.id
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                        marcada ? `border-2 ${r.destaque}` : "border-eco-blue/15 bg-white"
                      } ${bloqueada ? "" : "cursor-pointer"} ${bloqueada && !marcada ? "bg-eco-cream-light" : ""}`}
                    >
                      <input
                        type="radio"
                        name="recomendacao"
                        value={r.id}
                        checked={marcada}
                        disabled={bloqueada}
                        onChange={() => setEscolha(r.id)}
                        className="h-5 w-5 accent-current"
                      />
                      <span>
                        <span className={`font-inter block font-semibold ${marcada ? "" : "text-eco-blue"}`}>{r.rotulo}</span>
                        <span className="font-inter block text-xs text-eco-gray">{r.descricao}</span>
                      </span>
                    </label>
                  )
                })}
              </fieldset>

              {!bloqueada && (
                <>
                  <p className="font-inter rounded-xl bg-eco-orange-soft px-4 py-3 text-sm text-orange-700">
                    Depois de enviada, a avaliação só poderá ser alterada com autorização do administrador.
                  </p>
                  <MensagemErro>{msg.erro}</MensagemErro>
                  <MensagemSucesso>{msg.ok}</MensagemSucesso>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={salvarRascunho} disabled={ocupado} className={`${BOTAO_CONTORNO} py-2.5`}>
                      Salvar rascunho
                    </button>
                    <button type="button" onClick={() => setConfirmar(true)} disabled={ocupado || !podeEnviar} className={BOTAO_LARANJA}>
                      Enviar avaliação
                    </button>
                  </div>
                </>
              )}
              {bloqueada && (
                <>
                  <MensagemErro>{msg.erro}</MensagemErro>
                  <MensagemSucesso>{msg.ok}</MensagemSucesso>
                </>
              )}
            </section>
          </div>
        </>
      )}

      <Modal aberto={confirmar} titulo="Enviar avaliação?" onFechar={() => setConfirmar(false)}>
        {escolha && (
          <p className="font-inter flex flex-wrap items-center gap-3 rounded-xl bg-eco-cream-light px-4 py-3 text-sm text-eco-gray">
            Recomendação:
            <Selo cor={dadosRecomendacao(escolha).cor}>{dadosRecomendacao(escolha).rotulo}</Selo>
          </p>
        )}
        <p className="font-inter mt-4 text-eco-gray">
          Depois de enviada, você não poderá alterar o parecer nem a recomendação. Para alterá-los será necessária a
          autorização do administrador.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => setConfirmar(false)} className={BOTAO_CONTORNO}>
            Voltar e revisar
          </button>
          <button type="button" onClick={enviar} disabled={ocupado} className={BOTAO_LARANJA}>
            Enviar avaliação
          </button>
        </div>
      </Modal>
    </>
  )
}
