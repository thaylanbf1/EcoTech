import { useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Check, Lock } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { MSG_CREDENCIAIS_INVALIDAS } from "../api/auth"
import { Campo } from "../components/form"
import { BOTAO_LARANJA } from "../consts/estilos"
import { INICIO_DO_PERFIL, PERFIS } from "../consts/artigos"
import LayoutAcesso, { CaixaLateral } from "../components/LayoutAcesso"
import type { Perfil } from "../types/auth"

// Depois de algumas falhas seguidas, o botão fica bloqueado por um tempo.
// Vale para qualquer e-mail, existente ou não, então não revela nada.
// É só uma camada extra: o limite de tentativas de verdade fica no backend.
const MAX_TENTATIVAS = 5
const ESPERA_SEGUNDOS = 30

// Mensagem de "credenciais inválidas" do jeito do design
const MSG_ERRO_LOGIN = "E-mail ou senha incorretos. Verifique os dados e tente novamente."

export default function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Quem veio de uma rota protegida traz a origem e um aviso; quem saiu da
  // conta traz "saiu"
  const estado = location.state as { de?: string; perfil?: Perfil[]; aviso?: string; saiu?: boolean } | null

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [credenciaisErradas, setCredenciaisErradas] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [falhas, setFalhas] = useState(0)
  const [bloqueadoAte, setBloqueadoAte] = useState(0)
  const [agora, setAgora] = useState(() => Date.now())

  const restante = Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000))

  // Relógio só enquanto há bloqueio, para a contagem regressiva aparecer
  useEffect(() => {
    if (!bloqueadoAte) return
    const id = setInterval(() => {
      const t = Date.now()
      setAgora(t)
      if (t >= bloqueadoAte) {
        setBloqueadoAte(0)
        setErro("")
      }
    }, 1000)
    return () => clearInterval(id)
  }, [bloqueadoAte])

  // Quem já está logado não precisa ver o formulário
  if (usuario && !carregando) {
    return <Navigate to={INICIO_DO_PERFIL[usuario.perfil]} replace />
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (restante > 0) return
    setErro("")
    setCredenciaisErradas(false)
    setCarregando(true)
    try {
      const logado = await entrar({ email, senha })
      // O perfil vem da conta: cada um cai na sua área
      const destino =
        estado?.de && estado.perfil?.includes(logado.perfil) ? estado.de : INICIO_DO_PERFIL[logado.perfil]
      navigate(destino, { replace: true })
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : MSG_CREDENCIAIS_INVALIDAS
      const total = falhas + 1
      setFalhas(total)
      setSenha("")
      if (total >= MAX_TENTATIVAS) {
        const t = Date.now()
        setAgora(t)
        setBloqueadoAte(t + ESPERA_SEGUNDOS * 1000)
        setFalhas(0)
        setErro("Muitas tentativas seguidas. Aguarde um pouco e tente de novo.")
      } else if (mensagem === MSG_CREDENCIAIS_INVALIDAS) {
        setCredenciaisErradas(true)
        setErro(MSG_ERRO_LOGIN)
      } else {
        setErro(mensagem)
      }
      setCarregando(false)
    }
  }

  return (
    <LayoutAcesso
      titulo="Acesse o sistema"
      descricao="Um único acesso para todos os perfis. O que você pode ver e fazer depende do seu perfil de usuário."
      lateral={
        <div className="flex flex-col gap-3">
          {(["autor", "avaliador", "admin"] as const).map((p) => (
            <CaixaLateral key={p} titulo={PERFIS[p].rotulo} ponto>
              {PERFIS[p].descricao}
            </CaixaLateral>
          ))}
        </div>
      }
    >
      <h2 className="font-sora text-3xl font-extrabold text-eco-blue">Entrar</h2>
      <p className="font-inter mt-2 text-eco-gray">Use o e-mail e a senha cadastrados.</p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-5">
        {erro ? (
          <p role="alert" className="font-inter flex gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            {erro}
          </p>
        ) : estado?.saiu ? (
          <p role="status" className="font-inter flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            <Check size={16} />
            Você saiu da sua conta com segurança.
          </p>
        ) : (
          estado?.aviso && (
            <p className="font-inter flex items-center gap-3 rounded-xl bg-eco-blue-soft px-4 py-3 text-sm text-eco-blue">
              <Lock size={16} />
              {estado.aviso}
            </p>
          )
        )}

        <Campo
          label="E-mail"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={credenciaisErradas ? "[&_input]:border-red-500" : ""}
        />
        <Campo
          label="Senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          className={credenciaisErradas ? "[&_input]:border-red-500" : ""}
        />

        <Link to="/esqueci-senha" className="font-inter self-end text-sm font-semibold text-eco-orange hover:underline">
          Esqueci minha senha
        </Link>

        <button type="submit" disabled={carregando || restante > 0} className={`${BOTAO_LARANJA} py-3 text-base`}>
          {carregando ? "Entrando..." : restante > 0 ? `Aguarde ${restante}s` : "Entrar"}
        </button>

        <div className="font-inter flex flex-col gap-1 text-sm text-eco-gray">
          <p>
            Quer submeter um trabalho?{" "}
            <Link to="/cadastro" className="font-semibold text-eco-orange hover:underline">
              Crie sua conta de autor
            </Link>
          </p>
          <p>Não consegue acessar? Fale com a organização do evento.</p>
        </div>
      </form>
    </LayoutAcesso>
  )
}
