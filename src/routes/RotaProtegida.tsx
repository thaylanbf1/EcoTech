import type { ReactNode } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import PainelLayout from "../components/painel/PainelLayout"
import CabecalhoPainel from "../components/painel/CabecalhoPainel"
import { EstadoVazio } from "../components/painel/Elementos"
import { BOTAO_LARANJA, CARTAO_PAINEL } from "../consts/estilos"
import { INICIO_DO_PERFIL, PERFIS } from "../consts/artigos"
import type { Perfil } from "../types/auth"

interface RotaProtegidaProps {
  perfil: Perfil | Perfil[]
  // Aviso mostrado no login quando a pessoa ainda não entrou
  aviso?: string
  children: ReactNode
}

// Só mostra a página se houver alguém logado com um dos perfis exigidos.
// Sem login: manda para /login guardando de onde a pessoa veio.
// Logado com outro perfil: mostra "Acesso restrito" na área da própria pessoa.
export default function RotaProtegida({ perfil, aviso = "Faça login para continuar.", children }: RotaProtegidaProps) {
  const { usuario } = useAuth()
  const location = useLocation()
  const permitidos = Array.isArray(perfil) ? perfil : [perfil]

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname, perfil: permitidos, aviso }} />
  }
  if (permitidos.includes(usuario.perfil)) return children

  const exigido = permitidos.map((p) => PERFIS[p].rotulo.toLowerCase()).join(" ou ")
  const conteudo = (
    <>
      <CabecalhoPainel titulo="Acesso restrito" subtitulo={`Página exclusiva para o perfil ${exigido}.`} />
      <div className={CARTAO_PAINEL}>
        <EstadoVazio
          tom="vermelho"
          icone={<span className="font-sora text-4xl font-extrabold">!</span>}
          titulo="Acesso restrito"
          acao={
            <Link to={INICIO_DO_PERFIL[usuario.perfil]} className={`${BOTAO_LARANJA} py-3`}>
              Voltar ao início
            </Link>
          }
        >
          Seu perfil ({PERFIS[usuario.perfil].rotulo}) não tem permissão para acessar esta página. Ela está
          disponível apenas para o perfil {exigido}.
        </EstadoVazio>
      </div>
    </>
  )

  // O participante não tem painel lateral: o aviso fica na página comum
  if (usuario.perfil === "participante") {
    return <section className="mx-auto max-w-5xl px-6 py-16">{conteudo}</section>
  }
  return <PainelLayout perfil={usuario.perfil}>{conteudo}</PainelLayout>
}
