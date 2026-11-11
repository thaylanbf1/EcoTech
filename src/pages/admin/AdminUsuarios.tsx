import { useMemo, useState, type FormEvent } from "react"
import { Search, UserPlus } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useCarregar } from "../../hooks/useCarregar"
import { alterarPerfil, criarUsuario, listarUsuarios } from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Carregando, Linha, Selo, Tabela } from "../../components/painel/Elementos"
import Modal from "../../components/Modal"
import { Campo, MensagemErro, Selecao } from "../../components/form"
import { BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { PERFIS } from "../../consts/artigos"
import { TAMANHO_MINIMO_SENHA } from "../../consts/inscricao"
import { formatarData } from "../../helpers/formatar"
import { estiloInput } from "../../helpers/estilos"
import type { NovoUsuario } from "../../types/artigos"
import type { Perfil } from "../../types/auth"

const GRADE = "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_13rem]"
const OPCOES_PERFIL = (Object.keys(PERFIS) as Perfil[]).map((p) => ({ valor: p, label: PERFIS[p].rotulo }))
const NOVO: NovoUsuario = { nome: "", email: "", instituicao: "", perfil: "avaliador", senha: "" }

export default function AdminUsuarios() {
  const { usuario: eu } = useAuth()
  const { dados: usuarios, erro, recarregar, setDados } = useCarregar(listarUsuarios)
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<Perfil | "">("")
  const [erroLinha, setErroLinha] = useState("")
  const [novo, setNovo] = useState<NovoUsuario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroNovo, setErroNovo] = useState("")

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return (usuarios ?? []).filter(
      (u) =>
        (!filtro || u.perfil === filtro) &&
        (!termo || u.nome.toLowerCase().includes(termo) || u.email.includes(termo))
    )
  }, [usuarios, busca, filtro])

  const trocarPerfil = async (id: string, perfil: Perfil) => {
    setErroLinha("")
    try {
      const atualizado = await alterarPerfil(id, perfil)
      setDados((lista) => lista?.map((u) => (u.id === id ? atualizado : u)) ?? null)
    } catch (e) {
      setErroLinha(e instanceof Error ? e.message : "Não foi possível alterar o perfil.")
    }
  }

  const cadastrar = async (e: FormEvent) => {
    e.preventDefault()
    if (!novo) return
    setSalvando(true)
    setErroNovo("")
    try {
      await criarUsuario(novo)
      setNovo(null)
      recarregar()
    } catch (err) {
      setErroNovo(err instanceof Error ? err.message : "Não foi possível cadastrar.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <CabecalhoPainel
        titulo="Usuários"
        subtitulo="Cadastre usuários e defina quem é autor, avaliador Ad-Hoc ou administrador."
        acoes={
          <button type="button" onClick={() => setNovo(NOVO)} className={BOTAO_LARANJA}>
            <UserPlus size={16} />
            Novo usuário
          </button>
        }
      />
      <MensagemErro>{erro}</MensagemErro>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_16rem]">
        <label className="relative">
          <span className="sr-only">Buscar por nome ou e-mail</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eco-gray" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className={`${estiloInput} bg-white pl-9`}
          />
        </label>
        <select
          aria-label="Perfil"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Perfil | "")}
          className={`${estiloInput} bg-white`}
        >
          <option value="">Perfil: Todos</option>
          {OPCOES_PERFIL.map((o) => (
            <option key={o.valor} value={o.valor}>
              Perfil: {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={CARTAO_PAINEL}>
        <div className="flex items-center gap-3">
          <h2 className="font-sora text-xl font-bold text-eco-blue">Contas</h2>
          {usuarios && <Selo cor="bg-slate-100 text-slate-600">{visiveis.length} exibidas</Selo>}
        </div>
        <div className="mt-3">
          <MensagemErro>{erroLinha}</MensagemErro>
        </div>
        {!usuarios && !erro && <Carregando />}
        {usuarios && (
          <Tabela colunas={["Nome", "E-mail", "Cadastro", "Perfil"]} grade={GRADE}>
            {visiveis.map((u) => (
              <Linha key={u.id} grade={GRADE}>
                <span className="font-inter font-semibold text-eco-blue">
                  {u.nome}
                  {u.instituicao && <span className="block text-xs font-normal text-eco-gray">{u.instituicao}</span>}
                </span>
                <span className="font-inter break-all text-sm text-eco-gray">{u.email}</span>
                <span className="font-inter text-sm text-eco-gray">{formatarData(u.criadoEm)}</span>
                {u.id === eu?.id ? (
                  <span>
                    <Selo cor={PERFIS[u.perfil].cor}>{PERFIS[u.perfil].rotulo} (você)</Selo>
                  </span>
                ) : (
                  <select
                    aria-label={`Perfil de ${u.nome}`}
                    value={u.perfil}
                    onChange={(e) => trocarPerfil(u.id, e.target.value as Perfil)}
                    className={`${estiloInput} bg-white py-2`}
                  >
                    {OPCOES_PERFIL.map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </Linha>
            ))}
          </Tabela>
        )}
      </div>

      <Modal aberto={!!novo} titulo="Novo usuário" onFechar={() => setNovo(null)}>
        {novo && (
          <form onSubmit={cadastrar} className="flex flex-col gap-4">
            <Campo label="Nome completo" required minLength={3} value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <Campo label="E-mail" type="email" required value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
            <Campo label="Instituição" value={novo.instituicao} onChange={(e) => setNovo({ ...novo, instituicao: e.target.value })} />
            <Selecao
              label="Perfil"
              opcoes={OPCOES_PERFIL}
              value={novo.perfil}
              onChange={(e) => setNovo({ ...novo, perfil: e.target.value as Perfil })}
            />
            <Campo
              label="Senha inicial"
              type="text"
              required
              minLength={TAMANHO_MINIMO_SENHA}
              autoComplete="off"
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              ajuda="Passe a senha para a pessoa por um canal privado. Ela pode trocar depois em “Esqueci minha senha”."
            />
            <MensagemErro>{erroNovo}</MensagemErro>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setNovo(null)} className={BOTAO_CONTORNO}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className={BOTAO_LARANJA}>
                {salvando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
