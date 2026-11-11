import { useState } from "react"
import { Link } from "react-router-dom"
import { useCarregar } from "../../hooks/useCarregar"
import { listarSubmissoes } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { CartaoNumero, Carregando, Linha, Selo, Tabela } from "../../components/painel/Elementos"
import ModalAtribuir from "../../components/artigos/ModalAtribuir"
import { MensagemErro } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import type { ResumoSubmissao } from "../../types/artigos"

const GRADE = "lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_9rem_11rem]"

// Em que pé está a avaliação de cada artigo
function etapa(a: ResumoSubmissao) {
  if (a.status === "submetido") return { rotulo: "Sem avaliador", cor: "bg-red-100 text-red-700" }
  if (a.status === "em_avaliacao") return { rotulo: "Em avaliação", cor: "bg-eco-orange-soft text-orange-700" }
  return { rotulo: "Avaliado", cor: "bg-green-100 text-green-700" }
}

// Distribui os artigos entre os avaliadores Ad-Hoc
export default function AdminAvaliadores() {
  const { dados: artigos, erro, recarregar } = useCarregar(listarSubmissoes)
  const [artigo, setArtigo] = useState<ResumoSubmissao | null>(null)

  const contar = (rotulo: string) => artigos?.filter((a) => etapa(a).rotulo === rotulo).length ?? "–"

  return (
    <>
      <CabecalhoPainel titulo="Avaliadores" subtitulo="Delegue um avaliador Ad-Hoc para cada artigo enviado." />
      <MensagemErro>{erro}</MensagemErro>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoNumero rotulo="Total" valor={artigos?.length ?? "–"} />
        <CartaoNumero rotulo="Sem avaliador" valor={contar("Sem avaliador")} />
        <CartaoNumero rotulo="Em avaliação" valor={contar("Em avaliação")} />
        <CartaoNumero rotulo="Avaliados" valor={contar("Avaliado")} />
      </div>

      <div className={`${CARTAO_PAINEL} mt-6`}>
        <h2 className="font-sora text-xl font-bold text-eco-blue">Artigos submetidos</h2>
        {!artigos && !erro && <Carregando />}
        {artigos && !artigos.length && (
          <p className="font-inter py-8 text-center text-eco-gray">Nenhum artigo foi enviado ainda.</p>
        )}
        {artigos && artigos.length > 0 && (
          <Tabela colunas={["Artigo", "Autor", "Avaliador", "Status", ""]} grade={GRADE}>
            {artigos.map((a) => {
              const e = etapa(a)
              return (
                <Linha key={a.id} grade={GRADE}>
                  <span className="font-inter font-semibold text-eco-blue">{a.titulo}</span>
                  <span className="font-inter text-sm text-eco-gray">{a.autores[0]}</span>
                  <span className="font-inter text-sm text-eco-gray">{a.avaliadores?.join(", ") || "—"}</span>
                  <span>
                    <Selo cor={e.cor}>{e.rotulo}</Selo>
                  </span>
                  <span className="lg:justify-self-end">
                    {e.rotulo === "Sem avaliador" && (
                      <button type="button" onClick={() => setArtigo(a)} className={BOTAO_LARANJA}>
                        Atribuir avaliador
                      </button>
                    )}
                    {e.rotulo === "Em avaliação" && (
                      <Link to={`/admin/submissoes/${a.id}`} className={BOTAO_CONTORNO}>
                        Reatribuir
                      </Link>
                    )}
                    {e.rotulo === "Avaliado" && (
                      <Link to="/admin/avaliacoes" className={BOTAO_CONTORNO}>
                        Ver avaliação
                      </Link>
                    )}
                  </span>
                </Linha>
              )
            })}
          </Tabela>
        )}
      </div>

      <ModalAtribuir artigo={artigo} onFechar={() => setArtigo(null)} onAtribuido={recarregar} />
    </>
  )
}
