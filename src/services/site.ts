import { get, post, put } from "../api/api"
import { comTratamento } from "../api/erros"
import { SITE_PADRAO } from "../consts/site"
import { USAR_MOCK } from "../mocks/mock"
import type { ConfigSite, EventoAnterior, SiteResposta } from "../types/site"

// No modo mock não há servidor: a configuração vive só na memória da página
let siteMock: SiteResposta = { ...SITE_PADRAO, status: "ativo", dataInicio: "2026-10-15" }
let anterioresMock: EventoAnterior[] = []

export function obterSite(): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve(siteMock)
  return comTratamento(() => get<SiteResposta>("/site"))
}

export function salvarSite(config: ConfigSite): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve((siteMock = { ...siteMock, ...config }))
  return comTratamento(() => put<SiteResposta>("/admin/site", config))
}

export function encerrarEvento(): Promise<SiteResposta> {
  if (USAR_MOCK) {
    const encerrado: EventoAnterior = {
      id: String(anterioresMock.length + 1),
      nome: siteMock.titulo,
      encerradoEm: new Date().toISOString(),
      dataInicio: siteMock.dataInicio,
      dataFim: siteMock.dataInicio,
      local: siteMock.localExibicao,
      inscritos: 0,
      atividades: 0,
      site: { ...siteMock, menu: siteMock.menu },
    }
    anterioresMock = [encerrado, ...anterioresMock]
    return Promise.resolve((siteMock = { ...siteMock, status: "encerrado" }))
  }
  return comTratamento(() => post<SiteResposta>("/admin/evento/encerrar", {}))
}

export function listarEventosAnteriores(): Promise<EventoAnterior[]> {
  if (USAR_MOCK) return Promise.resolve(anterioresMock)
  return comTratamento(() => get<EventoAnterior[]>("/eventos-anteriores"))
}

// Reabre o site para um novo evento (depois de encerrar o anterior)
export function criarNovoEvento(): Promise<SiteResposta> {
  if (USAR_MOCK) return Promise.resolve((siteMock = { ...siteMock, status: "ativo" }))
  return comTratamento(() => post<SiteResposta>("/admin/evento/novo", {}))
}

export function obterEventoAnterior(id: string): Promise<EventoAnterior> {
  if (USAR_MOCK) {
    const evento = anterioresMock.find((e) => e.id === id)
    return evento ? Promise.resolve(evento) : Promise.reject(new Error("Evento não encontrado."))
  }
  return comTratamento(() => get<EventoAnterior>(`/eventos-anteriores/${id}`))
}
