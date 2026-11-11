import type { ArquivoArtigo } from "../types/artigos"
import type { EventoAnterior, TemplateSite } from "../types/site"

// "PDF · 12 páginas · 1,8 MB"
export function descreverArquivo(a: ArquivoArtigo) {
  const mb = (a.tamanho / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })
  return ["PDF", a.paginas ? `${a.paginas} ${a.paginas === 1 ? "página" : "páginas"}` : "", `${mb} MB`]
    .filter(Boolean)
    .join(" · ")
}

export const NOME_TEMPLATE: Record<TemplateSite, string> = {
  classico: "Clássico",
  moderno: "Moderno",
  minimalista: "Minimalista",
}

// "15 a 16 de Outubro" + ano do evento, quando o texto não traz o ano
export function dataDoEvento(e: EventoAnterior) {
  const texto = e.site.dataExibicao
  return /\d{4}/.test(texto) ? texto : `${texto} de ${e.dataInicio.slice(0, 4)}`
}
