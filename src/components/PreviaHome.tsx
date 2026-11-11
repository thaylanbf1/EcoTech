import { useEffect, useRef, useState } from "react"
import HomeView from "./HomeView"
import { variaveisCss } from "../helpers/site"
import type { ConfigSite } from "../types/site"

const LARGURA_PREVIA = 1200

// Home em tamanho real, reduzida para caber na coluna (editor do site e
// página de um evento anterior)
export default function PreviaHome({ config, dataInicio }: { config: ConfigSite; dataInicio: string }) {
  const caixa = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(0.3)
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const obs = new ResizeObserver(() => setEscala(el.clientWidth / LARGURA_PREVIA))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={caixa} className="w-full overflow-hidden rounded-xl border border-eco-blue/15" style={{ height: 640 * escala }}>
      <div
        inert
        style={{ ...variaveisCss(config), width: LARGURA_PREVIA, transform: `scale(${escala})`, transformOrigin: "top left" }}
      >
        <HomeView config={config} dataInicio={dataInicio} />
      </div>
    </div>
  )
}
