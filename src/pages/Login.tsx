import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { LogIn, ShieldCheck, UserRound } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import type { Perfil } from "../types/auth"

const ABAS_LOGIN: { id: Perfil; label: string; icon: typeof UserRound }[] = [
  { id: "participante", label: "Participante", icon: UserRound },
  { id: "admin", label: "Administrador", icon: ShieldCheck },
]

const DESTINO_PADRAO: Record<Perfil, string> = {
  participante: "/minha-inscricao",
  admin: "/admin",
}

export default function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Quando vem de uma rota protegida, a RotaProtegida informa a origem e o perfil
  const estado = location.state as { de?: string; perfil?: Perfil } | null

  const [perfil, setPerfil] = useState<Perfil>(estado?.perfil ?? "participante")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  // Quem já está logado não precisa ver o formulário
  if (usuario && !carregando) {
    return <Navigate to={DESTINO_PADRAO[usuario.perfil]} replace />
  }

  const trocarAba = (novo: Perfil) => {
    setPerfil(novo)
    setErro("")
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const logado = await entrar({ email, senha, perfil })
      const destino =
        estado?.de && estado.perfil === logado.perfil ? estado.de : DESTINO_PADRAO[logado.perfil]
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar.")
      setCarregando(false)
    }
  }

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-sora text-center text-4xl font-bold text-eco-blue">Entrar</h1>
        <p className="font-sora mt-4 text-center text-eco-gray">
          Acesse sua área no EcoTech.
        </p>

        <div className="mt-10 rounded-3xl border-2 border-eco-blue/15 bg-white p-6 sm:p-8">
          <div
            role="tablist"
            aria-label="Tipo de acesso"
            className="grid grid-cols-2 gap-2 rounded-full bg-eco-cream p-1"
          >
            {ABAS_LOGIN.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={perfil === id}
                aria-controls="form-login"
                onClick={() => trocarAba(id)}
                className={`font-sora inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  perfil === id ? "bg-eco-blue text-white" : "text-eco-blue hover:bg-eco-blue/10"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <form id="form-login" role="tabpanel" onSubmit={enviar} className="mt-8 flex flex-col gap-5">
            <label className="font-sora flex flex-col gap-2 text-sm font-bold text-eco-blue">
              E-mail
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={perfil === "admin" ? "admin@ecotech.com" : "seu@email.com"}
                className="rounded-xl border-2 border-eco-blue/20 px-4 py-3 font-normal text-eco-gray outline-none focus:border-eco-blue"
              />
            </label>

            <label className="font-sora flex flex-col gap-2 text-sm font-bold text-eco-blue">
              Senha
              <input
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="rounded-xl border-2 border-eco-blue/20 px-4 py-3 font-normal text-eco-gray outline-none focus:border-eco-blue"
              />
            </label>

            {erro && (
              <p role="alert" className="font-sora rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="font-sora mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-eco-blue px-6 py-3 font-bold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
            >
              <LogIn size={18} />
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {perfil === "participante" && (
            <p className="font-sora mt-6 text-center text-sm text-eco-gray">
              Ainda não se inscreveu?{" "}
              <Link to="/inscricao" className="font-bold text-eco-blue underline">
                Faça sua inscrição
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
