import HomeView from "./HomeView"
import PreviaEscalada from "./PreviaEscalada"
import { variaveisCss } from "../helpers/site"
import type { ConfigSite } from "../types/site"

// Home em tamanho real, reduzida para caber na coluna (editor do site e
// página de um evento anterior)
export default function PreviaHome({ config, dataInicio }: { config: ConfigSite; dataInicio: string }) {
  return (
    <PreviaEscalada estilo={variaveisCss(config)}>
      <HomeView config={config} dataInicio={dataInicio} />
    </PreviaEscalada>
  )
}
