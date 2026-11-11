import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { Check } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { cadastrarAutor } from "../api/auth"
import { Campo, MensagemErro } from "../components/form"
import { BOTAO_LARANJA } from "../consts/estilos"
import { INICIO_DO_PERFIL } from "../consts/artigos"
import { TAMANHO_MINIMO_SENHA } from "../consts/inscricao"
import LayoutAcesso, { CaixaLateral } from "../components/LayoutAcesso"

const AVISO_PERFIL = (
  <CaixaLateral titulo="O cadastro cria uma conta de Autor.">
    Perfis de avaliador Ad-Hoc e administrador são definidos pela organização do evento.
  </CaixaLateral>
)

// Cadastro público de autor (quem submete artigos)
export default function Cadastro() {
  const { usuario } = useAuth()
  const [form, setForm] = useState({ nome: "", email: "", instituicao: "", senha: "", confirmacao: "" })
  const [aceite, setAceite] = useState(false)
  const [erros, setErros] = useState<Partial<Record<keyof typeof form | "geral", string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [criada, setCriada] = useState("")

  if (usuario) return <Navigate to={INICIO_DO_PERFIL[usuario.perfil]} replace />

  const alterar = (campo: keyof typeof form, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: undefined, geral: undefined }))
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const novos: typeof erros = {}
    if (form.senha.length < TAMANHO_MINIMO_SENHA) novos.senha = `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres.`
    if (form.confirmacao !== form.senha) novos.confirmacao = "As senhas não conferem."
    if (!aceite) novos.geral = "Aceite os termos de uso e a política de privacidade para continuar."
    setErros(novos)
    if (Object.keys(novos).length) return

    setEnviando(true)
    try {
      await cadastrarAutor({
        nome: form.nome,
        email: form.email,
        instituicao: form.instituicao,
        senha: form.senha,
        aceite,
      })
      setCriada(form.email.trim().toLowerCase())
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Não foi possível criar a conta."
      // E-mail repetido aparece embaixo do campo, como no design
      setErros(mensagem.includes("e-mail já está cadastrado") ? { email: mensagem } : { geral: mensagem })
    } finally {
      setEnviando(false)
    }
  }

  if (criada) {
    return (
      <LayoutAcesso
        titulo="Tudo pronto!"
        descricao="Sua conta de autor foi criada. Entre com seu e-mail e senha para submeter e acompanhar seus trabalhos."
        lateral={AVISO_PERFIL}
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check size={40} strokeWidth={3} />
          </span>
          <h2 className="font-sora mt-5 text-2xl font-extrabold text-eco-blue">Conta criada com sucesso</h2>
          <p className="font-inter mt-3 text-eco-gray">
            Enviamos uma confirmação para {criada}. Você já pode entrar no sistema.
          </p>
          <Link to="/login" className={`${BOTAO_LARANJA} mt-6 w-full py-3`}>
            Ir para o login
          </Link>
        </div>
      </LayoutAcesso>
    )
  }

  return (
    <LayoutAcesso
      titulo="Crie sua conta"
      descricao="Cadastre-se para submeter seus trabalhos e acompanhar a situação de cada artigo."
      lateral={AVISO_PERFIL}
    >
      <h2 className="font-sora text-3xl font-extrabold text-eco-blue">Criar conta</h2>
      <p className="font-inter mt-2 text-eco-gray">Preencha os dados para se cadastrar como autor.</p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
        <Campo
          label="Nome completo"
          required
          autoComplete="name"
          minLength={3}
          value={form.nome}
          onChange={(e) => alterar("nome", e.target.value)}
          placeholder="Digite seu nome completo"
        />
        <Campo
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => alterar("email", e.target.value)}
          placeholder="seu@email.com"
          erro={erros.email}
        />
        <Campo
          label="Instituição"
          required
          autoComplete="organization"
          value={form.instituicao}
          onChange={(e) => alterar("instituicao", e.target.value)}
          placeholder="Universidade ou organização"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            label="Senha"
            type="password"
            required
            autoComplete="new-password"
            value={form.senha}
            onChange={(e) => alterar("senha", e.target.value)}
            placeholder={`Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`}
            erro={erros.senha}
          />
          <Campo
            label="Confirmar senha"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirmacao}
            onChange={(e) => alterar("confirmacao", e.target.value)}
            placeholder="Repita a senha"
            erro={erros.confirmacao}
          />
        </div>

        <label className="font-inter flex cursor-pointer items-center gap-2 text-sm text-eco-gray">
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => {
              setAceite(e.target.checked)
              setErros((er) => ({ ...er, geral: undefined }))
            }}
            className="h-4 w-4 accent-eco-orange"
          />
          Li e aceito os termos de uso e a política de privacidade
        </label>

        <MensagemErro>{erros.geral}</MensagemErro>

        <button type="submit" disabled={enviando} className={`${BOTAO_LARANJA} py-3 text-base`}>
          {enviando ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="font-inter text-center text-sm text-eco-gray">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-eco-orange hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </LayoutAcesso>
  )
}
