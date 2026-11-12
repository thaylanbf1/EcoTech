import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import Home from "../pages/Home"
import Sobre from "../pages/Sobre"
import Cronograma from "../pages/Cronograma"
import Exposicoes from "../pages/Exposicoes"
import Local from "../pages/Local"
import Patrocinadores from "../components/Patrocinadores"
import Parceiros from "../components/Parceiros"
import Inscricao from "../pages/Inscricao"
import PerfilPalestrante from "../pages/PerfilPalestrante"
import Palestras from "../pages/Palestras"
import PerfilPalestra from "../pages/PerfilPalestras"
import Acessibilidade from "../pages/Acessibilidade"
import EventosAnteriores from "../pages/EventosAnteriores"
import EventoAnteriorDetalhe from "../pages/EventoAnteriorDetalhe"
import PaginaLivre from "../pages/PaginaLivre"
import Login from "../pages/Login"
import Cadastro from "../pages/Cadastro"
import EsqueciSenha from "../pages/EsqueciSenha"
import RedefinirSenha from "../pages/RedefinirSenha"
import MinhaConta from "../pages/MinhaConta"
import PagarInscricao from "../pages/PagarInscricao"
import SimularPagamento from "../pages/SimularPagamento"
import ContaPainel from "../pages/ContaPainel"
import PainelLayout from "../components/painel/PainelLayout"
import AutorInicio from "../pages/autor/AutorInicio"
import AutorSubmissoes from "../pages/autor/AutorSubmissoes"
import AutorFormulario from "../pages/autor/AutorFormulario"
import AutorDetalhe from "../pages/autor/AutorDetalhe"
import AvaliadorInicio from "../pages/avaliador/AvaliadorInicio"
import AvaliadorTrabalhos from "../pages/avaliador/AvaliadorTrabalhos"
import AvaliarArtigo from "../pages/avaliador/AvaliarArtigo"
import AdminInicio from "../pages/admin/AdminInicio"
import AdminEventoAtivo from "../pages/admin/AdminEventoAtivo"
import AdminUsuarios from "../pages/admin/AdminUsuarios"
import AdminSubmissoes from "../pages/admin/AdminSubmissoes"
import AdminSubmissaoDetalhe from "../pages/admin/AdminSubmissaoDetalhe"
import AdminAvaliadores from "../pages/admin/AdminAvaliadores"
import AdminAvaliacoes from "../pages/admin/AdminAvaliacoes"
import {
  PaginaAnteriores,
  PaginaAtividades,
  PaginaDadosEvento,
  PaginaInscritos,
  PaginaSobre,
} from "../pages/admin/AdminSecoes"
import RotaProtegida from "./RotaProtegida"

// Telas de tela cheia: têm a própria moldura, sem a navbar e o rodapé do site
const SEM_MOLDURA = /^\/(login|cadastro|autor|avaliador|admin)(\/|$)/

const AVISO_ARTIGOS = "Faça login para ver os artigos submetidos."

function AppRoutes() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const semMoldura = SEM_MOLDURA.test(location.pathname)

  return (
    <>
      {!semMoldura && <NavBar/>}
      {/* clip, e não hidden: hidden transforma o main em área de rolagem e o
          menu lateral do painel (sticky) deixa de acompanhar a página */}
      <main className="w-full min-w-0 overflow-x-clip">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/sobre" element={<Sobre/>}/>
          <Route path="/cronograma" element={<Cronograma/>}/>
          <Route path="/exposicoes" element={<Exposicoes/>}/>
          <Route path="/local" element={<Local/>}/>
          <Route path="/patrocinadores" element={<Patrocinadores/>}/>
          <Route path="/parceiros" element={<Parceiros/>}/>
          <Route path="/acessibilidade" element={<Acessibilidade/>}/>
          <Route path="/eventos-anteriores" element={<EventosAnteriores/>}/>
          <Route path="/eventos-anteriores/:id" element={<EventoAnteriorDetalhe/>}/>
          <Route path="/inscricao" element={<Inscricao/>}/>
          <Route path="/pagina/:slug" element={<PaginaLivre/>}/>
          <Route path="/palestrantes/:slug" element={<PerfilPalestrante/>}/>
          <Route path="/palestras" element={<Palestras/>}/>
          <Route path="/palestras/:slug" element={<PerfilPalestra/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/cadastro" element={<Cadastro/>}/>
          <Route path="/esqueci-senha" element={<EsqueciSenha/>}/>
          <Route path="/redefinir-senha" element={<RedefinirSenha/>}/>
          <Route
            path="/minha-conta"
            element={<RotaProtegida perfil="participante"><MinhaConta/></RotaProtegida>}
          />
          <Route
            path="/minha-conta/pagamento"
            element={<RotaProtegida perfil="participante"><PagarInscricao/></RotaProtegida>}
          />
          <Route path="/pagamento/simular" element={<SimularPagamento/>}/>
          <Route path="/minha-inscricao" element={<Navigate to="/minha-conta" replace/>}/>

          <Route element={<RotaProtegida perfil="autor" aviso={AVISO_ARTIGOS}><PainelLayout perfil="autor"/></RotaProtegida>}>
            <Route path="/autor" element={<AutorInicio/>}/>
            <Route path="/autor/submissoes" element={<AutorSubmissoes/>}/>
            <Route path="/autor/submissoes/nova" element={<AutorFormulario/>}/>
            <Route path="/autor/submissoes/:id" element={<AutorDetalhe/>}/>
            <Route path="/autor/submissoes/:id/editar" element={<AutorFormulario/>}/>
            <Route path="/autor/conta" element={<ContaPainel/>}/>
          </Route>

          <Route element={<RotaProtegida perfil="avaliador" aviso={AVISO_ARTIGOS}><PainelLayout perfil="avaliador"/></RotaProtegida>}>
            <Route path="/avaliador" element={<AvaliadorInicio/>}/>
            <Route path="/avaliador/trabalhos" element={<AvaliadorTrabalhos/>}/>
            <Route path="/avaliador/avaliacoes" element={<AvaliadorTrabalhos somenteEnviadas/>}/>
            <Route path="/avaliador/trabalhos/:id" element={<AvaliarArtigo/>}/>
            <Route path="/avaliador/conta" element={<ContaPainel/>}/>
          </Route>

          <Route element={<RotaProtegida perfil="admin"><PainelLayout perfil="admin"/></RotaProtegida>}>
            <Route path="/admin" element={<AdminInicio/>}/>
            <Route path="/admin/evento" element={<AdminEventoAtivo/>}/>
            <Route path="/admin/dados-evento" element={<PaginaDadosEvento/>}/>
            <Route path="/admin/sobre" element={<PaginaSobre/>}/>
            <Route path="/admin/atividades" element={<PaginaAtividades/>}/>
            <Route path="/admin/inscritos" element={<PaginaInscritos/>}/>
            <Route path="/admin/usuarios" element={<AdminUsuarios/>}/>
            <Route path="/admin/submissoes" element={<AdminSubmissoes/>}/>
            <Route path="/admin/submissoes/:id" element={<AdminSubmissaoDetalhe/>}/>
            <Route path="/admin/avaliacoes" element={<AdminAvaliacoes/>}/>
            <Route path="/admin/avaliadores" element={<AdminAvaliadores/>}/>
            <Route path="/admin/anteriores" element={<PaginaAnteriores/>}/>
            <Route path="/admin/conta" element={<ContaPainel/>}/>
          </Route>
        </Routes>
      </main>
      {!isHome && !semMoldura && <Footer/>}
    </>
  )
}

export default AppRoutes
