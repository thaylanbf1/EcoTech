import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import logoPadrao from "../assets/exo_logo_branca.png"
import { useSite } from "../hooks/useSite"

interface Props {
  titulo: string
  descricao: string
  // Conteúdo extra do lado azul, abaixo da descrição
  lateral?: ReactNode
  children: ReactNode
}

// Tela dividida do login e do cadastro: apresentação à esquerda, cartão à direita
export default function LayoutAcesso({ titulo, descricao, lateral, children }: Props) {
  const { site } = useSite()
  return (
    <div className="grid min-h-screen bg-eco-cream lg:grid-cols-[minmax(0,46%)_1fr]">
      <section className="flex flex-col rounded-b-[3rem] bg-eco-blue px-6 py-8 text-white sm:px-10 lg:rounded-b-none lg:rounded-r-[5rem] lg:py-12">
        <Link to="/" className="flex items-center gap-3 self-start">
          <img src={site.logoUrl || logoPadrao} alt="" className="h-10 w-10 object-contain" />
          <span className="font-inter text-lg font-bold">Engenharia de Software na Amazônia</span>
        </Link>
        <div className="my-10 flex max-w-xl flex-1 flex-col justify-center lg:my-0">
          <h1 className="font-sora text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{titulo}</h1>
          <p className="font-sora mt-5 text-lg text-white/90">{descricao}</p>
          {lateral && <div className="mt-8">{lateral}</div>}
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-lg rounded-3xl border border-eco-blue/10 bg-white p-6 sm:p-10">{children}</div>
      </section>
    </div>
  )
}

// Caixa translúcida do lado azul (perfis no login, aviso no cadastro)
export function CaixaLateral({ titulo, children, ponto }: { titulo: string; children: ReactNode; ponto?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/10 px-4 py-3">
      {ponto && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-eco-green" />}
      <div>
        <p className="font-inter font-semibold">{titulo}</p>
        <p className="font-inter text-sm text-white/75">{children}</p>
      </div>
    </div>
  )
}
