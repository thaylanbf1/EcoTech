import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { useCarregar } from "../../hooks/useCarregar"
import { listarMinhasSubmissoes } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando, EstadoVazio } from "../../components/painel/Elementos"
import ListaSubmissoes from "../../components/artigos/ListaSubmissoes"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"

export default function AutorSubmissoes() {
  const { dados: artigos, erro } = useCarregar(listarMinhasSubmissoes)

  return (
    <>
      <CabecalhoPainel titulo="Minhas submissões" subtitulo="Acompanhe a situação dos artigos que você enviou." />
      <div className="mb-5">
        <Aviso>Você vê apenas os artigos enviados por você.</Aviso>
      </div>
      <MensagemErro>{erro}</MensagemErro>
      {!artigos && !erro && <Carregando />}

      {artigos && !artigos.length && (
        <div className={CARTAO_PAINEL}>
          <EstadoVazio
            icone={<Plus size={36} strokeWidth={3} />}
            titulo="Você ainda não submeteu artigos"
            acao={
              <Link to="/autor/submissoes/nova" className={`${BOTAO_LARANJA} py-3`}>
                Nova submissão
              </Link>
            }
          >
            Quando você enviar um trabalho, ele aparecerá aqui com título, autores, data de submissão e situação.
          </EstadoVazio>
        </div>
      )}

      {artigos && artigos.length > 0 && (
        <ListaSubmissoes
          titulo="Meus artigos"
          artigos={artigos}
          acaoTopo={
            <Link to="/autor/submissoes/nova" className={BOTAO_CONTORNO}>
              Nova submissão
            </Link>
          }
          link={(a) =>
            a.status === "rascunho"
              ? { to: `/autor/submissoes/${a.id}/editar`, label: "Editar" }
              : { to: `/autor/submissoes/${a.id}`, label: "Ver detalhes" }
          }
        />
      )}
    </>
  )
}
