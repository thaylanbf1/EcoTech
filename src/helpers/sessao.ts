import type { LoginResposta } from "../types/auth"

const CHAVE_SESSAO = "ecotech:sessao"

// O localStorage pode lançar erro (modo privado, armazenamento bloqueado),
// por isso toda leitura/escrita fica dentro de try/catch.
export function lerSessao(): LoginResposta | null {
  try {
    const salvo = localStorage.getItem(CHAVE_SESSAO)
    return salvo ? (JSON.parse(salvo) as LoginResposta) : null
  } catch {
    return null
  }
}

export function salvarSessao(sessao: LoginResposta) {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  } catch {
    // sem armazenamento: a sessão dura só até recarregar a página
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    // nada a fazer
  }
}
