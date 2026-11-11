import { useEffect, useState, type KeyboardEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FileText, Plus, Trash2, X } from "lucide-react"
import {
  criarSubmissao,
  enviarArquivo,
  enviarParaAvaliacao,
  excluirRascunho,
  obterMinhaSubmissao,
  salvarSubmissao,
} from "../../services/artigos"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Aviso, Carregando, Rotulo } from "../../components/painel/Elementos"
import { descreverArquivo } from "../../helpers/artigos"
import Modal from "../../components/Modal"
import { Campo, MensagemErro, MensagemSucesso } from "../../components/form"
import { AREA_TEXTO, BOTAO_CONTORNO, BOTAO_LARANJA, CARTAO_PAINEL } from "../../consts/estilos"
import { TAMANHO_MAXIMO_PDF_MB } from "../../consts/artigos"
import { estiloInput } from "../../helpers/estilos"
import type { ArquivoArtigo, DadosSubmissao, Pessoa, Submissao } from "../../types/artigos"

const VAZIO: DadosSubmissao = { titulo: "", resumo: "", palavrasChave: [], coautores: [] }
const MIN_RESUMO = 50
const MAX_PALAVRAS = 8

// Nova submissão e edição de rascunho. Depois de enviado, o artigo não muda.
export default function AutorFormulario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState<DadosSubmissao>(VAZIO)
  const [arquivoSalvo, setArquivoSalvo] = useState<ArquivoArtigo | null>(null)
  const [arquivoNovo, setArquivoNovo] = useState<File | null>(null)
  const [palavra, setPalavra] = useState("")
  const [carregado, setCarregado] = useState(!id)
  const [ocupado, setOcupado] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [msg, setMsg] = useState({ erro: "", ok: "" })

  useEffect(() => {
    if (!id) return
    obterMinhaSubmissao(id)
      .then((s) => {
        if (s.status !== "rascunho") return navigate(`/autor/submissoes/${id}`, { replace: true })
        setForm({ titulo: s.titulo, resumo: s.resumo, palavrasChave: s.palavrasChave, coautores: s.coautores })
        setArquivoSalvo(s.arquivo)
        setCarregado(true)
      })
      .catch((e) => setMsg({ erro: e instanceof Error ? e.message : "Não foi possível carregar.", ok: "" }))
  }, [id, navigate])

  const alterar = <K extends keyof DadosSubmissao>(campo: K, valor: DadosSubmissao[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setMsg({ erro: "", ok: "" })
  }

  const adicionarPalavra = () => {
    const nova = palavra.trim().replace(/,$/, "")
    if (nova && form.palavrasChave.length < MAX_PALAVRAS && !form.palavrasChave.includes(nova)) {
      alterar("palavrasChave", [...form.palavrasChave, nova])
    }
    setPalavra("")
  }
  const teclaPalavra = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      adicionarPalavra()
    }
  }

  const alterarCoautor = (i: number, parcial: Partial<Pessoa>) =>
    alterar("coautores", form.coautores.map((c, j) => (j === i ? { ...c, ...parcial } : c)))

  const escolherArquivo = (arquivo: File | undefined) => {
    setMsg({ erro: "", ok: "" })
    if (!arquivo) return
    if (arquivo.type !== "application/pdf") return setMsg({ erro: "O arquivo precisa ser um PDF.", ok: "" })
    if (arquivo.size > TAMANHO_MAXIMO_PDF_MB * 1024 * 1024) {
      return setMsg({ erro: `O PDF pode ter no máximo ${TAMANHO_MAXIMO_PDF_MB} MB.`, ok: "" })
    }
    setArquivoNovo(arquivo)
  }

  // Salva os dados (cria o rascunho na primeira vez) e depois o PDF, se mudou
  const salvar = async (): Promise<Submissao> => {
    const dados = { ...form, palavrasChave: palavra.trim() ? [...form.palavrasChave, palavra.trim()] : form.palavrasChave }
    let s = id ? await salvarSubmissao(id, dados) : await criarSubmissao(dados)
    if (arquivoNovo) {
      s = await enviarArquivo(s.id, arquivoNovo)
      setArquivoNovo(null)
      setArquivoSalvo(s.arquivo)
    }
    setPalavra("")
    setForm((f) => ({ ...f, palavrasChave: s.palavrasChave }))
    return s
  }

  const executar = async (acao: () => Promise<void>) => {
    setOcupado(true)
    setMsg({ erro: "", ok: "" })
    try {
      await acao()
    } catch (e) {
      setMsg({ erro: e instanceof Error ? e.message : "Não foi possível salvar.", ok: "" })
    } finally {
      setOcupado(false)
    }
  }

  const salvarRascunho = () =>
    executar(async () => {
      const s = await salvar()
      setMsg({ erro: "", ok: "Rascunho salvo. Você pode continuar depois." })
      if (!id) navigate(`/autor/submissoes/${s.id}/editar`, { replace: true })
    })

  // O que falta para enviar (o servidor confere de novo)
  const pendencias = [
    form.titulo.trim().length < 3 && "o título",
    form.resumo.trim().length < MIN_RESUMO && `um resumo com pelo menos ${MIN_RESUMO} caracteres`,
    !form.palavrasChave.length && !palavra.trim() && "pelo menos uma palavra-chave",
    !arquivoSalvo && !arquivoNovo && "o PDF do artigo",
  ].filter(Boolean)

  const enviar = () =>
    executar(async () => {
      setConfirmar(false)
      const s = await salvar()
      await enviarParaAvaliacao(s.id)
      navigate(`/autor/submissoes/${s.id}`, { replace: true })
    })

  const excluir = () => {
    if (!id || !confirm("Excluir este rascunho? Essa ação não pode ser desfeita.")) return
    executar(async () => {
      await excluirRascunho(id)
      navigate("/autor/submissoes", { replace: true })
    })
  }

  const arquivo = arquivoNovo ? { nome: arquivoNovo.name, tamanho: arquivoNovo.size, paginas: null } : arquivoSalvo

  return (
    <>
      <CabecalhoPainel
        voltar={{ to: "/autor/submissoes", label: "Minhas submissões" }}
        titulo={id ? "Editar rascunho" : "Nova submissão"}
        subtitulo="Preencha os dados do trabalho. Você pode salvar como rascunho e enviar depois."
      />
      {!carregado ? (
        msg.erro ? <MensagemErro>{msg.erro}</MensagemErro> : <Carregando />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setConfirmar(true)
          }}
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start"
        >
          <div className="flex flex-col gap-6">
            <section className={`${CARTAO_PAINEL} flex flex-col gap-5`}>
              <h2 className="font-sora text-xl font-bold text-eco-blue">Dados do artigo</h2>
              <Campo
                label="Título"
                required
                maxLength={250}
                value={form.titulo}
                onChange={(e) => alterar("titulo", e.target.value)}
                placeholder="Título completo do trabalho"
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="resumo" className="font-sora text-xs font-bold text-eco-blue">
                  Resumo
                </label>
                <textarea
                  id="resumo"
                  rows={7}
                  maxLength={3000}
                  value={form.resumo}
                  onChange={(e) => alterar("resumo", e.target.value)}
                  placeholder="Apresente o objetivo, o método e os principais resultados."
                  className={AREA_TEXTO}
                />
                <p className="font-inter text-xs text-eco-gray">
                  {form.resumo.trim().length} caracteres · mínimo de {MIN_RESUMO} para enviar
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="palavra" className="font-sora text-xs font-bold text-eco-blue">
                  Palavras-chave
                </label>
                {form.palavrasChave.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.palavrasChave.map((p) => (
                      <span key={p} className="font-inter inline-flex items-center gap-1 rounded-full bg-eco-blue-soft py-1 pl-3 pr-1.5 text-xs font-semibold text-eco-blue">
                        {p}
                        <button
                          type="button"
                          aria-label={`Remover ${p}`}
                          onClick={() => alterar("palavrasChave", form.palavrasChave.filter((x) => x !== p))}
                          className="cursor-pointer rounded-full p-0.5 hover:bg-eco-blue/10"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  id="palavra"
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                  onKeyDown={teclaPalavra}
                  onBlur={adicionarPalavra}
                  disabled={form.palavrasChave.length >= MAX_PALAVRAS}
                  maxLength={40}
                  placeholder="Digite e aperte Enter (ex.: Arquitetura)"
                  className={estiloInput}
                />
                <p className="font-inter text-xs text-eco-gray">Até {MAX_PALAVRAS} palavras-chave.</p>
              </div>
            </section>

            <section className={`${CARTAO_PAINEL} flex flex-col gap-4`}>
              <div>
                <h2 className="font-sora text-xl font-bold text-eco-blue">Coautores</h2>
                <p className="font-inter mt-1 text-sm text-eco-gray">
                  Você já aparece como autor. Adicione aqui quem escreveu o trabalho com você.
                </p>
              </div>
              {form.coautores.map((c, i) => (
                <div key={i} className="grid gap-3 rounded-xl bg-eco-cream-light p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                  <Campo label="Nome" required value={c.nome} onChange={(e) => alterarCoautor(i, { nome: e.target.value })} />
                  <Campo label="E-mail" type="email" required value={c.email} onChange={(e) => alterarCoautor(i, { email: e.target.value })} />
                  <Campo label="Instituição" value={c.instituicao} onChange={(e) => alterarCoautor(i, { instituicao: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => alterar("coautores", form.coautores.filter((_, j) => j !== i))}
                    aria-label="Remover coautor"
                    className="cursor-pointer self-end rounded-lg p-3 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {form.coautores.length < 10 && (
                <button
                  type="button"
                  onClick={() => alterar("coautores", [...form.coautores, { nome: "", email: "", instituicao: "" }])}
                  className={`${BOTAO_CONTORNO} self-start`}
                >
                  <Plus size={16} />
                  Adicionar coautor
                </button>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-6 xl:sticky xl:top-6">
            <section className={`${CARTAO_PAINEL} flex flex-col gap-3`}>
              <h2 className="font-sora text-xl font-bold text-eco-blue">Arquivo</h2>
              <Rotulo>PDF do artigo · até {TAMANHO_MAXIMO_PDF_MB} MB</Rotulo>
              {arquivo && (
                <div className="flex items-center gap-3 rounded-xl border border-eco-blue/10 bg-eco-cream-light px-4 py-3">
                  <FileText size={22} className="shrink-0 text-eco-gray" />
                  <div className="min-w-0">
                    <p className="font-inter truncate font-semibold text-eco-blue">{arquivo.nome}</p>
                    <p className="font-inter text-xs text-eco-gray">
                      {descreverArquivo(arquivo)}
                      {arquivoNovo && " · ainda não salvo"}
                    </p>
                  </div>
                </div>
              )}
              <label className={`${BOTAO_CONTORNO} self-start`}>
                {arquivo ? "Trocar PDF" : "Escolher PDF"}
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    escolherArquivo(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
              </label>
            </section>

            <section className={`${CARTAO_PAINEL} flex flex-col gap-3`}>
              {pendencias.length > 0 ? (
                <Aviso>Para enviar, falta: {pendencias.join(", ")}.</Aviso>
              ) : (
                <Aviso>Tudo pronto. Depois de enviado, o artigo não pode mais ser alterado.</Aviso>
              )}
              <MensagemErro>{msg.erro}</MensagemErro>
              <MensagemSucesso>{msg.ok}</MensagemSucesso>
              <button type="submit" disabled={ocupado || pendencias.length > 0} className={`${BOTAO_LARANJA} py-3`}>
                Enviar para avaliação
              </button>
              <button type="button" onClick={salvarRascunho} disabled={ocupado || form.titulo.trim().length < 3} className={BOTAO_CONTORNO}>
                {ocupado ? "Salvando..." : "Salvar rascunho"}
              </button>
              {id && (
                <button type="button" onClick={excluir} disabled={ocupado} className="font-inter cursor-pointer py-2 text-sm font-semibold text-red-700 hover:underline">
                  Excluir rascunho
                </button>
              )}
            </section>
          </div>
        </form>
      )}

      <Modal aberto={confirmar} titulo="Enviar para avaliação?" onFechar={() => setConfirmar(false)}>
        <p className="font-inter text-eco-gray">
          Depois de enviado, o artigo segue para o administrador designar os avaliadores e não pode mais ser alterado.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => setConfirmar(false)} className={BOTAO_CONTORNO}>
            Voltar e revisar
          </button>
          <button type="button" onClick={enviar} disabled={ocupado} className={BOTAO_LARANJA}>
            Enviar artigo
          </button>
        </div>
      </Modal>
    </>
  )
}
