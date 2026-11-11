import type { ReactNode } from "react"
import { AVISO_INFO, CARTAO_PAINEL } from "../../consts/estilos"

// Peças repetidas nas telas de autor, avaliador e admin

export function Selo({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <span className={`font-inter inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${cor}`}>
      {children}
    </span>
  )
}

export function CartaoNumero({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className={CARTAO_PAINEL}>
      <p className="font-inter text-sm text-eco-gray">{rotulo}</p>
      <p className="font-sora mt-1 text-3xl font-extrabold text-eco-blue">{valor}</p>
    </div>
  )
}

export function Aviso({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className={`${AVISO_INFO} flex flex-wrap items-center justify-between gap-3`}>
      <div>{children}</div>
      {acao}
    </div>
  )
}

export function EstadoVazio({
  icone,
  titulo,
  children,
  acao,
  tom = "azul",
}: {
  icone: ReactNode
  titulo: string
  children?: ReactNode
  acao?: ReactNode
  tom?: "azul" | "vermelho"
}) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          tom === "vermelho" ? "bg-red-100 text-red-700" : "bg-eco-blue-soft text-eco-blue"
        }`}
      >
        {icone}
      </div>
      <h2 className="font-sora mt-5 text-2xl font-bold text-eco-blue">{titulo}</h2>
      {children && <div className="font-inter mt-3 max-w-md text-eco-gray">{children}</div>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  )
}

// Tabela em "linhas-cartão", como no design. Em telas pequenas cada linha
// vira um bloco empilhado e os títulos das colunas somem.
export function Tabela({ colunas, grade, children }: { colunas: string[]; grade: string; children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className={`hidden gap-4 px-4 lg:grid ${grade}`}>
        {colunas.map((c, i) => (
          <span key={i} className="font-inter text-xs font-semibold uppercase tracking-wide text-eco-gray">
            {c}
          </span>
        ))}
      </div>
      {children}
    </div>
  )
}

export function Linha({ grade, children }: { grade: string; children: ReactNode }) {
  return (
    <div className={`grid grid-cols-1 items-center gap-2 rounded-xl bg-eco-cream-light px-4 py-4 lg:gap-4 ${grade}`}>
      {children}
    </div>
  )
}

export function Carregando() {
  return <p className="font-inter py-8 text-center text-eco-gray">Carregando...</p>
}

export function Rotulo({ children }: { children: ReactNode }) {
  return <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-eco-gray">{children}</p>
}
