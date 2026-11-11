import { Link } from "react-router-dom"
import { useCarregar } from "../../hooks/useCarregar"
import { listarSubmissoes } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando } from "../../components/painel/Elementos"
import ListaSubmissoes from "../../components/artigos/ListaSubmissoes"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, CARTAO_PAINEL } from "../../consts/estilos"

export default function AdminSubmissoes() {
  const { dados: artigos, erro } = useCarregar(listarSubmissoes)

  return (
    <>
      <CabecalhoPainel titulo="Submissões" subtitulo="Todos os artigos enviados ao evento." />
      <div className="mb-5">
        <Aviso>Como administrador, você vê os artigos de todos os autores.</Aviso>
      </div>
      <MensagemErro>{erro}</MensagemErro>
      {!artigos && !erro && <Carregando />}
      {artigos && !artigos.length && (
        <div className={CARTAO_PAINEL}>
          <p className="font-inter py-10 text-center text-eco-gray">Nenhum artigo foi enviado ainda.</p>
        </div>
      )}
      {artigos && artigos.length > 0 && (
        <ListaSubmissoes
          titulo="Todos os artigos"
          artigos={artigos}
          porPagina={8}
          acaoTopo={
            <Link to="/admin/avaliadores" className={BOTAO_CONTORNO}>
              Atribuir avaliadores
            </Link>
          }
          link={(a) => ({ to: `/admin/submissoes/${a.id}`, label: "Ver detalhes" })}
        />
      )}
    </>
  )
}
