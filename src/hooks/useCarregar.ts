import { useCallback, useEffect, useState } from "react"

// Busca dados ao abrir a tela e guarda erro e "recarregar" num lugar só.
// "buscar" precisa ser estável (função fora do componente ou useCallback).
export function useCarregar<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState("")

  const recarregar = useCallback(async () => {
    try {
      setDados(await buscar())
      setErro("")
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar.")
    }
  }, [buscar])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial dos dados
    recarregar()
  }, [recarregar])

  return { dados, erro, recarregar, setDados }
}
