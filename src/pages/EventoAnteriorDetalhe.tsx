import { useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useCarregar } from "../hooks/useCarregar"
import { obterEventoAnterior } from "../services/site"
import PreviaHome from "../components/PreviaHome"
import { NOME_TEMPLATE, dataDoEvento } from "../helpers/artigos"
import { Rotulo, Selo } from "../components/painel/Elementos"
import { MensagemErro } from "../components/form"
import { AVISO_INFO, CARTAO_PAINEL } from "../consts/estilos"
import { formatarData } from "../helpers/formatar"

const nomeImagem = (url: string) => (!url ? "Padrão do site" : url.startsWith("data:") ? "Imagem enviada" : url.split("/").pop())

export default function EventoAnteriorDetalhe() {
  const { id = "" } = useParams()
  const { dados: evento, erro } = useCarregar(useCallback(() => obterEventoAnterior(id), [id]))
  const site = evento?.site

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <Link to="/eventos-anteriores" className="font-inter inline-flex items-center gap-2 text-sm font-semibold text-eco-blue hover:underline">
        <ArrowLeft size={16} />
        Eventos anteriores
      </Link>
      <MensagemErro>{erro}</MensagemErro>
      {!evento && !erro && <p className="font-inter mt-6 text-eco-gray">Carregando...</p>}

      {evento && site && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <h1 className="font-sora text-3xl font-extrabold text-eco-blue sm:text-4xl">{site.titulo}</h1>
            <Selo cor="bg-slate-100 text-slate-600">Encerrado em {formatarData(evento.encerradoEm)}</Selo>
          </div>
          <p className={`${AVISO_INFO} mt-5`}>Somente consulta — eventos encerrados não podem ser editados.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
            <div className="flex flex-col gap-6">
              <div className={CARTAO_PAINEL}>
                <h2 className="font-sora mb-4 text-lg font-bold text-eco-blue">Como a página ficou</h2>
                <PreviaHome config={site} dataInicio={evento.dataInicio} />
              </div>
              <div className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
                <h2 className="font-sora text-lg font-bold text-eco-blue">Conteúdo definido</h2>
                <div>
                  <Rotulo>Título principal</Rotulo>
                  <p className="font-inter text-eco-blue">{site.titulo}</p>
                </div>
                <div>
                  <Rotulo>Descrição</Rotulo>
                  <p className="font-inter text-eco-blue">{site.descricao}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Rotulo>Data</Rotulo>
                    <p className="font-inter text-eco-blue">{dataDoEvento(evento)}</p>
                  </div>
                  <div>
                    <Rotulo>Local</Rotulo>
                    <p className="font-inter text-eco-blue">{site.localExibicao}</p>
                  </div>
                </div>
                <p className="font-inter text-sm text-eco-gray">
                  {evento.inscritos} inscritos · {evento.atividades} atividades
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
                <h2 className="font-sora text-lg font-bold text-eco-blue">Definições visuais</h2>
                <p className="font-inter flex items-center gap-3 text-sm font-semibold text-eco-blue">
                  Template <Selo cor="bg-green-100 text-green-700">{NOME_TEMPLATE[site.template]}</Selo>
                </p>
                <p className="font-inter text-sm font-semibold text-eco-blue">Cores</p>
                {[
                  ["Cor primária", site.corPrimaria],
                  ["Cor secundária", site.corSecundaria],
                  ["Cor de fundo", site.corFundo],
                ].map(([rotulo, cor]) => (
                  <div key={rotulo} className="flex items-center gap-4 rounded-xl bg-eco-cream-light px-4 py-3">
                    <span className="h-10 w-10 rounded-lg border border-black/20" style={{ background: cor }} />
                    <span className="font-inter flex-1 text-sm text-eco-blue">{rotulo}</span>
                    <span className="font-inter text-sm uppercase text-eco-gray">{cor}</span>
                  </div>
                ))}
                <p className="font-inter text-sm font-semibold text-eco-blue">Imagens</p>
                <p className="font-inter text-sm text-eco-gray">
                  Logo: {nomeImagem(site.logoUrl)}
                  <br />
                  Banner: {nomeImagem(site.bannerUrl) === "Padrão do site" ? "Sem banner" : nomeImagem(site.bannerUrl)}
                </p>
              </div>

              <div className={`${CARTAO_PAINEL} flex flex-col gap-3`}>
                <h2 className="font-sora text-lg font-bold text-eco-blue">Itens do menu</h2>
                {site.menu.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-eco-cream-light px-4 py-3">
                    <span className={`font-inter ${item.visivel ? "text-eco-blue" : "text-eco-gray"}`}>{item.rotulo}</span>
                    <Selo cor={item.visivel ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                      {item.visivel ? "Visível" : "Oculto"}
                    </Selo>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
