import { useEffect, useState } from "react"
import Modal from "../Modal"
import { Campo, MensagemErro } from "../form"
import { BOTAO_CONTORNO, BOTAO_LARANJA } from "../../consts/estilos"
import { atribuirAvaliadores, listarAvaliadores } from "../../services/artigos"
import type { Avaliador } from "../../types/artigos"

interface Props {
  // null = fechado
  artigo: { id: string; titulo: string } | null
  // Quem já avalia o artigo (vem marcado) e o prazo atual
  selecionados?: string[]
  prazo?: string
  onFechar: () => void
  onAtribuido: () => void
}

// Prazo sugerido: daqui a 15 dias
function prazoPadrao() {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toLocaleDateString("sv-SE")
}

export default function ModalAtribuir({ artigo, selecionados = [], prazo, onFechar, onAtribuido }: Props) {
  const [avaliadores, setAvaliadores] = useState<Avaliador[] | null>(null)
  const [marcados, setMarcados] = useState<string[]>([])
  const [data, setData] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  // A cada abertura: recarrega a carga de cada avaliador e repõe a seleção
  useEffect(() => {
    if (!artigo) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia o formulário ao abrir
    setMarcados(selecionados)
    setData(prazo ?? prazoPadrao())
    setErro("")
    listarAvaliadores()
      .then(setAvaliadores)
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar os avaliadores."))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando abre para outro artigo
  }, [artigo?.id])

  const alternar = (id: string) =>
    setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  const confirmar = async () => {
    if (!artigo) return
    setSalvando(true)
    setErro("")
    try {
      await atribuirAvaliadores(artigo.id, marcados, data)
      onAtribuido()
      onFechar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível atribuir.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={!!artigo} titulo="Atribuir avaliador" onFechar={onFechar} largura="max-w-xl">
      {artigo && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-eco-blue-soft px-4 py-3">
            <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-eco-gray">Artigo</p>
            <p className="font-inter font-semibold text-eco-blue">{artigo.titulo}</p>
          </div>

          <fieldset>
            <legend className="font-inter mb-2 text-sm font-semibold text-eco-blue">
              Selecione um ou mais avaliadores Ad-Hoc
            </legend>
            {!avaliadores && !erro && <p className="font-inter text-sm text-eco-gray">Carregando...</p>}
            {avaliadores && !avaliadores.length && (
              <p className="font-inter text-sm text-eco-gray">
                Nenhum avaliador cadastrado. Defina o perfil "Avaliador Ad-Hoc" em Usuários.
              </p>
            )}
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {avaliadores?.map((a) => {
                const marcado = marcados.includes(a.id)
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                      marcado ? "border-2 border-eco-orange bg-eco-orange-soft" : "border-eco-blue/10 bg-eco-cream-light"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(a.id)}
                      className="h-5 w-5 accent-eco-orange"
                    />
                    <span className="font-inter flex-1 font-semibold text-eco-blue">{a.nome}</span>
                    <span className="font-inter rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {a.trabalhos} {a.trabalhos === 1 ? "trabalho" : "trabalhos"}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <Campo label="Prazo para a avaliação" type="date" required value={data} onChange={(e) => setData(e.target.value)} />
          <MensagemErro>{erro}</MensagemErro>

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onFechar} className={BOTAO_CONTORNO}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={salvando || !marcados.length || !data}
              className={BOTAO_LARANJA}
            >
              {salvando ? "Salvando..." : "Confirmar atribuição"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
