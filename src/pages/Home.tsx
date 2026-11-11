import { useNavigate } from "react-router-dom"
import HomeView from "../components/HomeView"
import SemEventoAtivo from "../components/SemEventoAtivo"
import { useSite } from "../hooks/useSite"

const Home = () => {
  const navigate = useNavigate()
  const { site } = useSite()
  if (site.status === "encerrado") return <SemEventoAtivo />
  return <HomeView config={site} dataInicio={site.dataInicio} onVerProgramacao={() => navigate("/cronograma")} />
}

export default Home
