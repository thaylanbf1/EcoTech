import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useCarregar } from "../../hooks/useCarregar"
import { listarMinhasSubmissoes } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { CartaoNumero, Carregando, Linha, Selo, Tabela } from "../../components/painel/Elementos"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { STATUS_SUBMISSAO } from "../../consts/artigos"
import { formatarData } from "../../helpers/formatar"

const GRADE = "lg:grid-cols-[minmax(0,1fr)_11rem_8rem_7rem]"

export default function AutorInicio() {
  const { usuario } = useAuth()
  const { dados: artigos, erro } = useCarregar(listarMinhasSubmissoes)
  const conta = (f: (s: string) => boolean) => artigos?.filter((a) => f(a.status)).length ?? "–"

  return (
    <>
      <CabecalhoPainel
        titulo={`Olá, ${usuario?.nome.split(" ")[0] ?? ""}`}
        subtitulo="Acompanhe seus trabalhos submetidos ao evento."
      />
      <MensagemErro>{erro}</MensagemErro>

      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoNumero rotulo="Submetidos" valor={conta((s) => s !== "rascunho")} />
        <CartaoNumero rotulo="Em avaliação" valor={conta((s) => s === "em_avaliacao")} />
        <CartaoNumero rotulo="Aprovados" valor={conta((s) => s === "aprovado" || s === "aprovado_ressalvas")} />
      </div>

      <div className={`${CARTAO_PAINEL} mt-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-sora text-xl font-bold text-eco-blue">Minhas submissões</h2>
          <Link to="/autor/submissoes/nova" className={BOTAO_LARANJA}>
            Nova submissão
          </Link>
        </div>
        {!artigos && !erro && <Carregando />}
        {artigos && !artigos.length && (
          <p className="font-inter py-8 text-center text-eco-gray">Você ainda não submeteu artigos.</p>
        )}
        {artigos && artigos.length > 0 && (
          <Tabela colunas={["Título", "Status", "Envio", ""]} grade={GRADE}>
            {artigos.slice(0, 5).map((a) => (
              <Linha key={a.id} grade={GRADE}>
                <span className="font-inter font-semibold text-eco-blue">
                  {a.titulo}
                  {a.status === "rascunho" && " (rascunho)"}
                </span>
                <span>
                  <Selo cor={STATUS_SUBMISSAO[a.status].cor}>{STATUS_SUBMISSAO[a.status].rotulo}</Selo>
                </span>
                <span className="font-inter text-sm text-eco-gray">{a.submetidoEm ? formatarData(a.submetidoEm) : "—"}</span>
                <Link
                  to={a.status === "rascunho" ? `/autor/submissoes/${a.id}/editar` : `/autor/submissoes/${a.id}`}
                  className={`${BOTAO_CONTORNO} lg:justify-self-end`}
                >
                  {a.status === "rascunho" ? "Editar" : "Ver"}
                </Link>
              </Linha>
            ))}
          </Tabela>
        )}
      </div>
    </>
  )
}
