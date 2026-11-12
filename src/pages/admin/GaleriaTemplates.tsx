import Modal from "../../components/Modal"
import PreviaEscalada from "../../components/PreviaEscalada"
import PreviaTemplate from "./PreviaTemplate"
import { TEMPLATES_LIVRES, TEMPLATES_PRONTOS } from "../../consts/site"
import type { TemplatePagina } from "../../types/site"

interface Props {
  aberto: boolean
  titulo: string
  // Template atual do item (ao trocar); ausente ao adicionar
  atual?: TemplatePagina
  // Páginas prontas que já estão em outro item do menu
  emUso: Set<TemplatePagina>
  onEscolher: (template: TemplatePagina) => void
  onFechar: () => void
}

function Cartao({ id, nome, descricao, atual, ocupado, onEscolher }: {
  id: TemplatePagina; nome: string; descricao: string; atual: boolean; ocupado: boolean; onEscolher: () => void
}) {
  return (
    <button
      type="button"
      disabled={ocupado}
      aria-pressed={atual}
      onClick={onEscolher}
      className={`flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        atual ? "border-eco-blue bg-eco-blue-soft" : "border-eco-blue/15 hover:border-eco-blue"
      }`}
    >
      <PreviaEscalada altura={750}>
        <PreviaTemplate template={id} />
      </PreviaEscalada>
      <span>
        <span className="font-sora flex items-center justify-between gap-2 text-sm font-bold text-eco-blue">
          {nome}
          {atual && <span className="text-[11px] font-normal">Atual</span>}
          {ocupado && <span className="text-[11px] font-normal text-eco-gray">Já está no menu</span>}
        </span>
        <span className="font-sora mt-1 block text-xs text-eco-gray">{descricao}</span>
      </span>
    </button>
  )
}

// Escolha do template de um item do menu, com a prévia de cada um
export default function GaleriaTemplates({ aberto, titulo, atual, emUso, onEscolher, onFechar }: Props) {
  const grade = "mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onFechar} largura="max-w-5xl max-h-[90vh] overflow-y-auto">
      <h3 className="font-sora mt-2 text-sm font-bold text-eco-blue">Página livre</h3>
      <p className="font-sora text-xs text-eco-gray">Você escreve o conteúdo no próprio item do menu.</p>
      <div className={grade}>
        {TEMPLATES_LIVRES.map((t) => (
          <Cartao key={t.id} id={t.id} nome={t.nome} descricao={t.descricao} atual={atual === t.id} ocupado={false} onEscolher={() => onEscolher(t.id)} />
        ))}
      </div>

      <h3 className="font-sora mt-8 text-sm font-bold text-eco-blue">Página pronta do site</h3>
      <p className="font-sora text-xs text-eco-gray">O conteúdo vem do sistema. Cada uma só pode estar uma vez no menu.</p>
      <div className={grade}>
        {TEMPLATES_PRONTOS.filter((t) => t.id !== "inicio").map((t) => (
          <Cartao key={t.id} id={t.id} nome={t.nome} descricao={t.descricao} atual={atual === t.id} ocupado={atual !== t.id && emUso.has(t.id)} onEscolher={() => onEscolher(t.id)} />
        ))}
      </div>
    </Modal>
  )
}
