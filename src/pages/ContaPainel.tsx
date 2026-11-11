import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { atualizarConta } from "../api/auth"
import CabecalhoPainel from "../components/painel/CabecalhoPainel"
import { Selo } from "../components/painel/Elementos"
import { Campo, MensagemErro, MensagemSucesso } from "../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../consts/estilos"
import { PERFIS } from "../consts/artigos"

// "Minha conta" de autor, avaliador e admin (o participante tem a própria)
export default function ContaPainel() {
  const { usuario, atualizarUsuario } = useAuth()
  const [nome, setNome] = useState(usuario?.nome ?? "")
  const [instituicao, setInstituicao] = useState(usuario?.instituicao ?? "")
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  if (!usuario) return null
  const perfil = PERFIS[usuario.perfil]

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setMsg({ erro: "", ok: "" })
    try {
      atualizarUsuario(await atualizarConta({ nome, instituicao }))
      setMsg({ erro: "", ok: "Dados atualizados." })
    } catch (err) {
      setMsg({ erro: err instanceof Error ? err.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <CabecalhoPainel titulo="Minha conta" subtitulo="Seus dados de acesso ao sistema." />
      <form onSubmit={salvar} className={`${CARTAO_PAINEL} flex max-w-2xl flex-col gap-5`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-inter text-sm text-eco-gray">Perfil:</span>
          <Selo cor={perfil.cor}>{perfil.rotulo}</Selo>
        </div>
        <Campo label="Nome completo" required minLength={3} value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo label="E-mail" value={usuario.email} disabled ajuda="Para trocar o e-mail, fale com a organização do evento." />
        <Campo label="Instituição" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} />
        <MensagemErro>{msg.erro}</MensagemErro>
        <MensagemSucesso>{msg.ok}</MensagemSucesso>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={salvando} className={BOTAO_LARANJA}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <Link to="/esqueci-senha" className={BOTAO_CONTORNO}>
            Trocar senha
          </Link>
        </div>
      </form>
    </>
  )
}
