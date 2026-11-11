import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { iniciais } from "../../helpers/formatar"
import { PERFIS } from "../../consts/artigos"
import { Selo } from "./Elementos"

const CONTA_DO_PERFIL: Record<string, string> = {
  autor: "/autor/conta",
  avaliador: "/avaliador/conta",
  admin: "/admin/conta",
  participante: "/minha-conta",
}

// Avatar com nome e perfil; abre um menu com "Minha conta" e "Sair da conta"
function MenuUsuario() {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false)
    document.addEventListener("mousedown", fora)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", fora)
      document.removeEventListener("keydown", esc)
    }
  }, [aberto])

  if (!usuario) return null
  const perfil = PERFIS[usuario.perfil]

  return (
    <div ref={caixa} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-eco-blue/10 bg-white py-2 pl-2 pr-3 text-left"
      >
        <span className="font-sora flex h-11 w-11 items-center justify-center rounded-full bg-eco-orange text-sm font-bold text-white">
          {iniciais(usuario.nome)}
        </span>
        <span className="hidden flex-col items-start gap-1 sm:flex">
          <span className="font-inter text-sm font-semibold text-eco-blue">{usuario.nome}</span>
          <Selo cor={perfil.cor}>{perfil.rotulo}</Selo>
        </span>
        <ChevronDown size={16} className="text-eco-gray" />
      </button>

      {aberto && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-eco-blue/10 bg-white p-2 shadow-lg">
          <div className="border-b border-eco-blue/10 px-3 pb-3 pt-2">
            <p className="font-inter font-semibold text-eco-blue">{usuario.nome}</p>
            <p className="font-inter break-all text-sm text-eco-gray">{usuario.email}</p>
            <div className="mt-2">
              <Selo cor={perfil.cor}>{perfil.rotulo}</Selo>
            </div>
          </div>
          <Link
            role="menuitem"
            to={CONTA_DO_PERFIL[usuario.perfil]}
            onClick={() => setAberto(false)}
            className="font-inter mt-1 block rounded-lg px-3 py-2.5 text-sm text-eco-blue hover:bg-eco-blue-soft"
          >
            Minha conta
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              sair()
              navigate("/login", { replace: true, state: { saiu: true } })
            }}
            className="font-inter w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  )
}

interface Props {
  titulo: ReactNode
  subtitulo?: ReactNode
  voltar?: { to: string; label: string }
  // Botões à direita do título (ex.: "Salvar alterações")
  acoes?: ReactNode
}

export default function CabecalhoPainel({ titulo, subtitulo, voltar, acoes }: Props) {
  return (
    <div className="mb-6">
      {voltar && (
        <Link to={voltar.to} className="font-inter mb-4 inline-flex items-center gap-2 text-sm font-semibold text-eco-blue hover:underline">
          <ArrowLeft size={16} />
          {voltar.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sora text-3xl font-extrabold text-eco-blue sm:text-4xl">{titulo}</h1>
          {subtitulo && <p className="font-inter mt-2 text-eco-gray">{subtitulo}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {acoes && <div className="hidden flex-wrap gap-3 md:flex">{acoes}</div>}
          <MenuUsuario />
        </div>
      </div>
      {acoes && <div className="mt-4 flex flex-wrap gap-3 md:hidden">{acoes}</div>}
    </div>
  )
}
