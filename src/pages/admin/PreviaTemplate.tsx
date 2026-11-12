import { ExternalLink } from "lucide-react"
import { ConteudoLivre } from "../PaginaLivre"
import Sobre from "../Sobre"
import Cronograma from "../Cronograma"
import Palestras from "../Palestras"
import Exposicoes from "../Exposicoes"
import Local from "../Local"
import Acessibilidade from "../Acessibilidade"
import Patrocinadores from "../../components/Patrocinadores"
import Parceiros from "../../components/Parceiros"
import Etapas from "../../components/inscricao/Etapas"
import { ETAPAS_INSCRICAO } from "../../consts/inscricao"
import { conteudoEmBranco, conteudoVazio } from "../../consts/site"
import type { ConteudoPagina, TemplateLivre, TemplatePagina } from "../../types/site"

// Conteúdo de exemplo para a prévia de uma página livre ainda vazia
const EXEMPLO: Record<Exclude<TemplateLivre, "link">, ConteudoPagina> = {
  texto: {
    ...conteudoVazio(),
    titulo: "Hospedagem",
    texto:
      "Separamos algumas opções de hospedagem perto do local do evento, para quem vem de outras cidades.\n\nOs hotéis parceiros oferecem desconto para inscritos: basta apresentar o comprovante de inscrição.",
  },
  cartoes: {
    ...conteudoVazio(),
    titulo: "Comissão organizadora",
    texto: "Quem faz o evento acontecer.",
    blocos: [
      { titulo: "Coordenação geral", descricao: "Planejamento, programação e contato com os palestrantes.", imagem: "" },
      { titulo: "Comunicação", descricao: "Redes sociais, divulgação e identidade visual.", imagem: "" },
      { titulo: "Infraestrutura", descricao: "Espaço, equipamentos e acessibilidade.", imagem: "" },
    ],
  },
  perguntas: {
    ...conteudoVazio(),
    titulo: "Perguntas frequentes",
    blocos: [
      { titulo: "Preciso levar notebook?", descricao: "Só para os minicursos práticos.", imagem: "" },
      { titulo: "Vou receber certificado?", descricao: "Sim, enviado por e-mail depois do evento.", imagem: "" },
      { titulo: "Posso trocar de minicurso?", descricao: "Sim, até o prazo de troca, pela sua conta.", imagem: "" },
    ],
  },
}

// Só o topo da inscrição: a página de verdade redireciona quem está logado
function PreviaInscricao() {
  return (
    <section className="bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-sora text-4xl font-bold text-eco-blue lg:text-5xl">Inscrição</h1>
        <p className="font-sora mx-auto mt-4 max-w-xl text-eco-gray">Preencha seus dados, escolha os minicursos e pague pelo Pix.</p>
        <Etapas etapas={ETAPAS_INSCRICAO} atual={0} />
        <div className="mt-10 grid grid-cols-2 gap-5 rounded-3xl border-2 border-eco-blue bg-white p-10 text-left">
          {["Nome completo", "E-mail", "CPF", "Telefone", "Instituição", "Senha"].map((c) => (
            <div key={c}>
              <p className="font-sora text-xs font-bold text-eco-blue">{c}</p>
              <div className="mt-2 h-11 rounded-lg bg-eco-field" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// A página do template, como aparece no site. Páginas livres usam o conteúdo
// do item ou, vazias, um exemplo.
export default function PreviaTemplate({ template, rotulo, conteudo }: { template: TemplatePagina; rotulo?: string; conteudo?: ConteudoPagina }) {
  switch (template) {
    case "texto":
    case "cartoes":
    case "perguntas": {
      const exemplo = conteudoEmBranco(conteudo)
      return (
        <section className="bg-eco-cream px-6 py-24">
          <ConteudoLivre template={template} rotulo={exemplo ? EXEMPLO[template].titulo : rotulo ?? ""} conteudo={exemplo ? EXEMPLO[template] : conteudo!} />
        </section>
      )
    }
    case "link":
      return (
        <section className="flex h-[640px] flex-col items-center justify-center gap-6 bg-eco-cream px-6 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-eco-blue text-white"><ExternalLink size={44} /></span>
          <p className="font-sora text-4xl font-bold text-eco-blue">Abre outro site</p>
          <p className="font-sora max-w-xl break-all text-2xl text-eco-gray">{conteudo?.url || "https://..."}</p>
        </section>
      )
    case "sobre": return <Sobre />
    case "cronograma": return <Cronograma />
    case "palestras": return <Palestras />
    case "exposicoes": return <Exposicoes />
    case "local": return <Local />
    case "acessibilidade": return <Acessibilidade />
    case "patrocinadores": return <Patrocinadores />
    case "parceiros": return <Parceiros />
    case "inscricao": return <PreviaInscricao />
    case "inicio": return null
  }
}
