import type { Categoria, Filtro, Trabalho } from "../types/exposicoes";

export const FILTROS: Filtro[] = [
    "Todos", "Artigos", "Pôsteres", "Projetos"
];

export const FILTRO_PARA_CATEGORIA: Record<Filtro, Categoria | null> = {
  Todos: null,
  Artigos: "Artigo",
  Pôsteres: "Pôster",
  Projetos: "Projeto",
};

export const CORES_TAG: Record<Categoria, string> = {
  Artigo: "bg-eco-blue",
  Projeto: "bg-eco-green-light",
  Pôster: "bg-eco-green-dark",
};

export const TRABALHOS: Trabalho[] = [
  {
    categoria: "Artigo",
    titulo: "IA Aplicada ao Monitoramento Ambiental na Amazônia",
    autores: "L. Fernandes, R. Tavares",
  },
  {
    categoria: "Projeto",
    titulo: "Sistema de Gestão Acadêmica com Microsserviços",
    autores: "T. Andrade",
  },
  {
    categoria: "Pôster",
    titulo: "Análise de Dados Climáticos com Machine Learning",
    autores: "C. Nogueira, P. Lima",
  },
  {
    categoria: "Projeto",
    titulo: "App de Acessibilidade para Pessoas com Def. Visual",
    autores: "M. Rocha",
  },
  {
    categoria: "Artigo",
    titulo: "Segurança em Redes IoT para Áreas Rurais",
    autores: "B. Castro",
  },
  {
    categoria: "Pôster",
    titulo: "Plataforma Colaborativa de Ensino a Distância",
    autores: "F. Almeida, J. Souza",
  },
];