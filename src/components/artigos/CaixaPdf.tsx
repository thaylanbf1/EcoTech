import { useState } from "react"
import { FileText } from "lucide-react"
import { BOTAO_CONTORNO } from "../../consts/estilos"
import { baixarPdf } from "../../services/artigos"
import { descreverArquivo } from "../../helpers/artigos"
import type { ArquivoArtigo } from "../../types/artigos"

// Linha do arquivo com o botão de baixar. "previa" desenha a folha cinza do
// design (a tela do avaliador), sem abrir o PDF de verdade.
export default function CaixaPdf({
  submissaoId,
  arquivo,
  rotulo = "Baixar PDF",
  previa,
}: {
  submissaoId: string
  arquivo: ArquivoArtigo
  rotulo?: string
  previa?: boolean
}) {
  const [erro, setErro] = useState("")
  const [baixando, setBaixando] = useState(false)

  const baixar = async () => {
    setErro("")
    setBaixando(true)
    try {
      await baixarPdf(submissaoId, arquivo.nome)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível baixar o arquivo.")
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className={`rounded-xl ${previa ? "bg-eco-blue-soft p-4" : "border border-eco-blue/10 bg-eco-cream-light px-4 py-3"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileText size={22} className="shrink-0 text-eco-gray" />
          <div className="min-w-0">
            <p className="font-inter truncate font-semibold text-eco-blue">{arquivo.nome}</p>
            <p className="font-inter text-xs text-eco-gray">{descreverArquivo(arquivo)}</p>
          </div>
        </div>
        <button type="button" onClick={baixar} disabled={baixando} className={BOTAO_CONTORNO}>
          {baixando ? "Baixando..." : rotulo}
        </button>
      </div>
      {previa && (
        <div aria-hidden className="mt-4 flex flex-col gap-2.5 rounded-lg bg-white p-6">
          <span className="h-3 w-1/2 rounded bg-slate-300" />
          {[90, 80, 85, 60, 88, 75, 50].map((l, i) => (
            <span key={i} className="h-2 rounded bg-slate-200" style={{ width: `${l}%` }} />
          ))}
        </div>
      )}
      {erro && <p className="font-inter mt-2 text-sm text-red-700">{erro}</p>}
    </div>
  )
}
