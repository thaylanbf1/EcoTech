import { useSite } from "../../hooks/useSite"
import { useDadosEvento } from "../../hooks/useDadosEvento"
import CabecalhoPainel from "../../components/painel/CabecalhoPainel"
import { Carregando } from "../../components/painel/Elementos"
import ListaEventosAnteriores from "../../components/ListaEventosAnteriores"
import { MensagemErro } from "../../components/form"
import AdminInscritos from "./AdminInscritos"
import AdminAtividades from "./AdminAtividades"
import AdminSobre from "./AdminSobre"
import AdminEvento from "./AdminEvento"

// As seções que já existiam no painel, agora cada uma com a sua rota

export function PaginaInscritos() {
  const { evento, atividades, erro } = useDadosEvento()
  return (
    <>
      <CabecalhoPainel titulo="Inscritos" subtitulo="Acompanhe quem se inscreveu, os pedidos de acessibilidade e exporte a lista." />
      <MensagemErro>{erro}</MensagemErro>
      {evento ? <AdminInscritos atividades={atividades} /> : !erro && <Carregando />}
    </>
  )
}

export function PaginaAtividades() {
  const { evento, atividades, erro, recarregar } = useDadosEvento()
  return (
    <>
      <CabecalhoPainel titulo="Atividades" subtitulo="Cadastre minicursos e oficinas, com vagas e valores." />
      <MensagemErro>{erro}</MensagemErro>
      {evento ? <AdminAtividades atividades={atividades} evento={evento} onAlterar={recarregar} /> : !erro && <Carregando />}
    </>
  )
}

export function PaginaDadosEvento() {
  const { evento, erro, setEvento } = useDadosEvento()
  return (
    <>
      <CabecalhoPainel titulo="Dados do evento" subtitulo="Edite datas, local, valor da inscrição e prazos." />
      <MensagemErro>{erro}</MensagemErro>
      {evento ? <AdminEvento evento={evento} onSalvo={setEvento} /> : !erro && <Carregando />}
    </>
  )
}

export function PaginaSobre() {
  const { sobre, atualizarSobre } = useSite()
  return (
    <>
      <CabecalhoPainel titulo="Página Sobre" subtitulo="Edite o texto, o carrossel, os parceiros e os patrocinadores." />
      <AdminSobre sobre={sobre} onSalvo={atualizarSobre} />
    </>
  )
}

export function PaginaAnteriores() {
  return (
    <>
      <CabecalhoPainel titulo="Eventos anteriores" subtitulo="Consulte o que foi definido em cada edição encerrada." />
      <ListaEventosAnteriores />
    </>
  )
}
