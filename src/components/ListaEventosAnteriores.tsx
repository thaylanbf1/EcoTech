import { Link } from "react-router-dom"
import { useCarregar } from "../hooks/useCarregar"
import { listarEventosAnteriores } from "../services/site"
import { BOTAO_CONTORNO } from "../consts/estilos"
import { MensagemErro } from "./form"
import { NOME_TEMPLATE, dataDoEvento } from "../helpers/artigos"

export function Cores({ cores }: { cores: string[] }) {
  return (
    <span className="flex items-center gap-1.5">
      {cores.map((c, i) => (
        <span key={i} className="h-5 w-5 rounded-full border border-black/15" style={{ background: c }} />
      ))}
    </span>
  )
}

// Cartões dos eventos encerrados (página pública e painel do admin)
export default function ListaEventosAnteriores() {
  const { dados: lista, erro } = useCarregar(listarEventosAnteriores)

  if (erro) return <MensagemErro>{erro}</MensagemErro>
  if (!lista) return <p className="font-sora text-eco-gray">Carregando...</p>
  if (!lista.length) return <p className="font-sora text-eco-gray">Nenhum evento encerrado ainda.</p>

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {lista.map((e) => (
        <article key={e.id} className="flex flex-col overflow-hidden rounded-2xl border border-eco-blue/10 bg-white">
          <div className="relative flex h-32 items-end justify-between p-5" style={{ background: e.site.corPrimaria }}>
            <span className="font-inter rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white">
              Template: {NOME_TEMPLATE[e.site.template]}
            </span>
            <span className="absolute right-5 top-6 h-16 w-16 rounded-full" style={{ background: e.site.corSecundaria }} />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-6">
            <span className="font-inter self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Encerrado
            </span>
            <h2 className="font-sora text-xl font-bold text-eco-blue">{e.site.titulo}</h2>
            <p className="font-inter text-sm text-eco-gray">
              {dataDoEvento(e)}
              <br />
              {e.site.localExibicao}
            </p>
            <p className="font-inter mt-1 flex items-center gap-2 text-sm text-eco-gray">
              Cores <Cores cores={[e.site.corPrimaria, e.site.corSecundaria, e.site.corFundo]} />
            </p>
            <Link to={`/eventos-anteriores/${e.id}`} className={`${BOTAO_CONTORNO} mt-auto w-full py-3`}>
              Ver definições
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
