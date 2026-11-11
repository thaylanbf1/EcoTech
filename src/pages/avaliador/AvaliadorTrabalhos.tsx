import { Link } from "react-router-dom"
import { useCarregar } from "../../hooks/useCarregar"
import { listarTrabalhos } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando, Linha, Selo, Tabela } from "../../components/painel/Elementos"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_ATRIBUICAO, recomendacao } from "../../consts/artigos"
import { formatarData } from "../../helpers/formatar"
import type { TrabalhoAvaliador } from "../../types/artigos"

const GRADE = "lg:grid-cols-[minmax(0,1fr)_8rem_10rem_10rem]"

function acao(t: TrabalhoAvaliador) {
  if (t.status === "enviada") return { label: "Ver avaliação", estilo: BOTAO_CONTORNO }
  if (t.status === "pendente") return { label: "Avaliar", estilo: BOTAO_LARANJA }
  return { label: "Continuar", estilo: BOTAO_LARANJA }
}

// "Trabalhos atribuídos" (tudo) e "Minhas avaliações" (só as enviadas)
export default function AvaliadorTrabalhos({ somenteEnviadas }: { somenteEnviadas?: boolean }) {
  const { dados, erro } = useCarregar(listarTrabalhos)
  const trabalhos = somenteEnviadas ? dados?.filter((t) => t.status === "enviada") : dados

  return (
    <>
      <CabecalhoPainel
        titulo={somenteEnviadas ? "Minhas avaliações" : "Trabalhos atribuídos"}
        subtitulo={somenteEnviadas ? "Pareceres que você já enviou." : "Artigos que o administrador delegou para você avaliar."}
      />
      <div className="mb-5">
        <Aviso>
          Leia o artigo, escreva o parecer e escolha uma recomendação. Depois de enviada, a avaliação fica bloqueada.
        </Aviso>
      </div>
      <MensagemErro>{erro}</MensagemErro>

      <div className={CARTAO_PAINEL}>
        <h2 className="font-sora text-xl font-bold text-eco-blue">
          {somenteEnviadas ? "Avaliações enviadas" : "Meus artigos para avaliar"}
        </h2>
        {!trabalhos && !erro && <Carregando />}
        {trabalhos && !trabalhos.length && (
          <p className="font-inter py-8 text-center text-eco-gray">
            {somenteEnviadas ? "Você ainda não enviou nenhuma avaliação." : "Nenhum trabalho foi atribuído a você ainda."}
          </p>
        )}
        {trabalhos && trabalhos.length > 0 && (
          <Tabela colunas={["Artigo", "Prazo", somenteEnviadas ? "Recomendação" : "Status", ""]} grade={GRADE}>
            {trabalhos.map((t) => {
              const { label, estilo } = acao(t)
              const status = STATUS_ATRIBUICAO[t.status]
              return (
                <Linha key={t.id} grade={GRADE}>
                  <span className="font-inter font-semibold text-eco-blue">{t.titulo}</span>
                  <span className="font-inter text-sm text-eco-gray">{formatarData(t.prazo)}</span>
                  <span>
                    {somenteEnviadas && t.recomendacao ? (
                      <Selo cor={recomendacao(t.recomendacao).cor}>{recomendacao(t.recomendacao).rotulo}</Selo>
                    ) : (
                      <Selo cor={status.cor}>{status.rotulo}</Selo>
                    )}
                  </span>
                  <Link to={`/avaliador/trabalhos/${t.id}`} className={`${estilo} lg:justify-self-end`}>
                    {label}
                  </Link>
                </Linha>
              )
            })}
          </Tabela>
        )}
      </div>
    </>
  )
}
