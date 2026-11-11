import { useState } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { useSite } from "../../hooks/useSite"
import { useCarregar } from "../../hooks/useCarregar"
import { criarNovoEvento, listarEventosAnteriores } from "../../services/site"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { EstadoVazio, Selo } from "../../components/painel/Elementos"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { formatarData } from "../../helpers/formatar"
import AdminSite from "./AdminSite"

// Edita a página inicial do evento ativo. Sem evento ativo, oferece criar um.
export default function AdminEventoAtivo() {
  const { site, atualizarSite } = useSite()
  const encerrado = site.status === "encerrado"

  return (
    <>
      <CabecalhoPainel
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            Evento ativo
            {encerrado ? (
              <Selo cor="bg-slate-100 text-slate-600">Nenhum evento ativo</Selo>
            ) : (
              <Selo cor="bg-green-100 text-green-700">● Ativo</Selo>
            )}
          </span>
        }
        subtitulo={encerrado ? undefined : "As alterações aparecem na página inicial assim que você salvar."}
      />
      {encerrado ? (
        <SemEvento onCriado={atualizarSite} />
      ) : (
        <AdminSite key={JSON.stringify(site)} site={site} onSalvo={atualizarSite} />
      )}
    </>
  )
}

function SemEvento({ onCriado }: { onCriado: Parameters<typeof AdminSite>[0]["onSalvo"] }) {
  const { dados: anteriores } = useCarregar(listarEventosAnteriores)
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState("")
  const ultimo = anteriores?.[0]

  const criar = async () => {
    setCriando(true)
    setErro("")
    try {
      onCriado(await criarNovoEvento())
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o evento.")
      setCriando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={CARTAO_PAINEL}>
        <EstadoVazio
          icone={<Plus size={36} strokeWidth={3} />}
          titulo="Nenhum evento no momento"
          acao={
            <button type="button" onClick={criar} disabled={criando} className={`${BOTAO_LARANJA} py-3`}>
              {criando ? "Criando..." : "Criar novo evento"}
            </button>
          }
        >
          A página inicial está exibindo o aviso “Nenhum evento no momento”. Crie um novo evento para definir textos,
          cores, template e menu e publicá-lo. Os textos e cores do último evento ficam como ponto de partida.
        </EstadoVazio>
        <MensagemErro>{erro}</MensagemErro>
      </div>

      {ultimo && (
        <div className={`${CARTAO_PAINEL} flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
              style={{ background: ultimo.site.corPrimaria }}
            >
              <span className="h-6 w-6 rounded-full" style={{ background: ultimo.site.corSecundaria }} />
            </span>
            <div>
              <p className="font-inter text-xs text-eco-gray">Último evento encerrado</p>
              <p className="font-sora font-bold text-eco-blue">{ultimo.site.titulo}</p>
              <p className="font-inter text-xs text-eco-gray">Encerrado em {formatarData(ultimo.encerradoEm)}</p>
            </div>
          </div>
          <Link to="/admin/anteriores" className={BOTAO_CONTORNO}>
            Ver nos eventos anteriores
          </Link>
        </div>
      )}
    </div>
  )
}
