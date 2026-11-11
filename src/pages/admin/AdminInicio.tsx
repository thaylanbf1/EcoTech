import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useCarregar } from "../../hooks/useCarregar"
import { obterResumoAdmin } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { CartaoNumero } from "../../components/painel/Elementos"
import { MensagemErro } from "../../components/form"
import { CARTAO_PAINEL } from "../../consts/estilos"

const ATALHOS = [
  { to: "/admin/evento", titulo: "Evento ativo", texto: "Edite textos, cores, template e menu da página inicial." },
  { to: "/admin/usuarios", titulo: "Usuários e perfis", texto: "Cadastre usuários e defina autor, avaliador ou administrador." },
  { to: "/admin/submissoes", titulo: "Submissões", texto: "Acompanhe todos os trabalhos enviados." },
  { to: "/admin/avaliadores", titulo: "Avaliadores Ad-Hoc", texto: "Atribua trabalhos e acompanhe as avaliações." },
  { to: "/admin/anteriores", titulo: "Eventos anteriores", texto: "Consulte o histórico de eventos encerrados." },
  { to: "/admin/inscritos", titulo: "Inscritos", texto: "Veja quem se inscreveu, os pedidos de acessibilidade e exporte a lista." },
]

export default function AdminInicio() {
  const { dados: resumo, erro } = useCarregar(obterResumoAdmin)

  return (
    <>
      <CabecalhoPainel titulo="Visão geral" subtitulo="Gerencie o evento, os usuários e as avaliações do sistema." />
      <MensagemErro>{erro}</MensagemErro>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoNumero rotulo="Submissões" valor={resumo?.submissoes ?? "–"} />
        <CartaoNumero rotulo="Avaliadores Ad-Hoc" valor={resumo?.avaliadores ?? "–"} />
        <CartaoNumero rotulo="Usuários" valor={resumo?.usuarios ?? "–"} />
        <CartaoNumero rotulo="Evento ativo" valor={resumo ? (resumo.eventoAtivo ? "Sim" : "Não") : "–"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ATALHOS.map((a) => (
          <Link key={a.to} to={a.to} className={`${CARTAO_PAINEL} group flex flex-col gap-2 hover:border-eco-blue/30`}>
            <h2 className="font-sora text-xl font-bold text-eco-blue">{a.titulo}</h2>
            <p className="font-inter flex-1 text-sm text-eco-gray">{a.texto}</p>
            <span className="font-inter inline-flex items-center gap-1 text-sm font-semibold text-eco-orange group-hover:underline">
              Abrir <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
