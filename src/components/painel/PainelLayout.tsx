import { useState, type ReactNode } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import logoPadrao from "../../assets/exo_logo_branca.png"
import { useAuth } from "../../hooks/useAuth"
import { useSite } from "../../hooks/useSite"
import { PERFIS } from "../../consts/artigos"

type PerfilPainel = "autor" | "avaliador" | "admin"

interface ItemMenu {
  to: string
  label: string
}

const MENUS: Record<PerfilPainel, ItemMenu[]> = {
  autor: [
    { to: "/autor", label: "Início" },
    { to: "/autor/submissoes", label: "Minhas submissões" },
    { to: "/autor/submissoes/nova", label: "Nova submissão" },
    { to: "/autor/conta", label: "Minha conta" },
  ],
  avaliador: [
    { to: "/avaliador", label: "Início" },
    { to: "/avaliador/trabalhos", label: "Trabalhos atribuídos" },
    { to: "/avaliador/avaliacoes", label: "Minhas avaliações" },
    { to: "/avaliador/conta", label: "Minha conta" },
  ],
  admin: [
    { to: "/admin", label: "Início" },
    { to: "/admin/evento", label: "Evento ativo" },
    { to: "/admin/dados-evento", label: "Dados do evento" },
    { to: "/admin/sobre", label: "Página Sobre" },
    { to: "/admin/atividades", label: "Atividades" },
    { to: "/admin/inscritos", label: "Inscritos" },
    { to: "/admin/usuarios", label: "Usuários" },
    { to: "/admin/submissoes", label: "Submissões" },
    { to: "/admin/avaliacoes", label: "Avaliações" },
    { to: "/admin/avaliadores", label: "Avaliadores" },
    { to: "/admin/anteriores", label: "Eventos anteriores" },
  ],
}

// Rotas que têm páginas filhas mas não devem acender junto com elas
const SO_EXATA = new Set(["/autor", "/avaliador", "/admin", "/autor/submissoes"])

// Moldura das áreas logadas: menu azul à esquerda e conteúdo à direita.
// Recebe "children" quando a página não vem do roteador (ex.: acesso restrito).
export default function PainelLayout({ perfil, children }: { perfil: PerfilPainel; children?: ReactNode }) {
  const { sair } = useAuth()
  const { site } = useSite()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  const fazerLogout = () => {
    sair()
    navigate("/login", { replace: true, state: { saiu: true } })
  }

  const menu = (
    <nav className="flex flex-col gap-1">
      {MENUS[perfil].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={SO_EXATA.has(item.to)}
          onClick={() => setAberto(false)}
          className={({ isActive }) =>
            `font-inter rounded-lg px-4 py-2.5 text-[15px] ${isActive ? "bg-white/10 font-bold text-white" : "text-white/80 hover:text-white"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const rodape = (
    <div className="flex flex-col gap-1">
      <NavLink to="/" className="font-inter rounded-lg px-4 py-2.5 text-[15px] text-white/80 hover:text-white">
        Ver página pública
      </NavLink>
      <button
        type="button"
        onClick={fazerLogout}
        className="font-inter cursor-pointer rounded-lg px-4 py-2.5 text-left text-[15px] text-white/80 hover:text-white"
      >
        Sair
      </button>
    </div>
  )

  const marca = (
    <div className="flex items-center gap-3">
      <img src={site.logoUrl || logoPadrao} alt="" className="h-9 w-9 shrink-0 object-contain" />
      <div>
        <p className="font-sora text-lg font-extrabold leading-none text-white">ESA</p>
        <p className="font-inter mt-1 text-xs text-white/70">Perfil: {PERFIS[perfil].rotulo}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-eco-cream lg:flex">
      {/* Lateral fixa em telas grandes */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto bg-eco-blue px-4 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <div className="px-1">{marca}</div>
          {menu}
        </div>
        {rodape}
      </aside>

      {/* Barra no topo em telas pequenas, com o menu recolhível */}
      <header className="sticky top-0 z-40 bg-eco-blue px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          {marca}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
            className="cursor-pointer text-white"
          >
            {aberto ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        {aberto && (
          <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4">
            {menu}
            {rodape}
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">{children ?? <Outlet />}</main>
    </div>
  )
}
