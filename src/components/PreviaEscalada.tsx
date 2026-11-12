import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Mostra uma página em tamanho real ("largura" x "altura"), reduzida para
// caber na largura da caixa. O conteúdo não recebe cliques nem foco.
export default function PreviaEscalada({ largura = 1200, altura = 640, estilo, children }: {
  largura?: number
  altura?: number
  // Variáveis CSS aplicadas só dentro da prévia (ex.: cores do site)
  estilo?: CSSProperties
  children: ReactNode
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(0.3)
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const obs = new ResizeObserver(() => setEscala(el.clientWidth / largura))
    obs.observe(el)
    return () => obs.disconnect()
  }, [largura])
  return (
    <div ref={caixa} className="w-full overflow-hidden rounded-xl border border-eco-blue/15 bg-eco-cream" style={{ height: altura * escala }}>
      <div inert style={{ ...estilo, width: largura, transform: `scale(${escala})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  )
}
