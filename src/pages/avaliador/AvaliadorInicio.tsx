import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useCarregar } from "../../hooks/useCarregar"
import { listarTrabalhos } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { CartaoNumero, Carregando, Linha, Selo, Tabela } from "../../components/painel/Elementos"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, CARTAO_PAINEL } from "../../consts/estilos"
import { formatarData } from "../../helpers/formatar"

const GRADE = "lg:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem]"

export default function AvaliadorInicio() {
  const { usuario } = useAuth()
  const { dados: trabalhos, erro } = useCarregar(listarTrabalhos)
  const enviadas = trabalhos?.filter((t) => t.status === "enviada").length

  return (
    <>
      <CabecalhoPainel
        titulo={`Olá, ${usuario?.nome.split(" ")[0] ?? ""}`}
        subtitulo="Trabalhos que aguardam a sua avaliação."
      />
      <MensagemErro>{erro}</MensagemErro>

      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoNumero rotulo="Atribuídos a mim" valor={trabalhos?.length ?? "–"} />
        <CartaoNumero rotulo="Já avaliados" valor={enviadas ?? "–"} />
        <CartaoNumero rotulo="Pendentes" valor={trabalhos && enviadas !== undefined ? trabalhos.length - enviadas : "–"} />
      </div>

      <div className={`${CARTAO_PAINEL} mt-6`}>
        <h2 className="font-sora text-xl font-bold text-eco-blue">Trabalhos atribuídos</h2>
        {!trabalhos && !erro && <Carregando />}
        {trabalhos && !trabalhos.length && (
          <p className="font-inter py-8 text-center text-eco-gray">Nenhum trabalho foi atribuído a você ainda.</p>
        )}
        {trabalhos && trabalhos.length > 0 && (
          <Tabela colunas={["Título", "Prazo", "Status", ""]} grade={GRADE}>
            {trabalhos.map((t) => {
              const avaliado = t.status === "enviada"
              return (
                <Linha key={t.id} grade={GRADE}>
                  <span className="font-inter font-semibold text-eco-blue">{t.titulo}</span>
                  <span className="font-inter text-sm text-eco-gray">{formatarData(t.prazo)}</span>
                  <span>
                    <Selo cor={avaliado ? "bg-green-100 text-green-700" : "bg-eco-orange-soft text-orange-700"}>
                      {avaliado ? "Avaliado" : "Pendente"}
                    </Selo>
                  </span>
                  <Link to={`/avaliador/trabalhos/${t.id}`} className={`${BOTAO_CONTORNO} lg:justify-self-end`}>
                    {avaliado ? "Ver" : "Avaliar"}
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
