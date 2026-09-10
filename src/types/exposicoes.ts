export type Filtro = "Todos" | "Artigos" | "Pôsteres" | "Projetos";
export type Categoria = "Artigo" | "Projeto" | "Pôster";

export interface Trabalho {
  categoria: Categoria;
  titulo: string;
  autores: string;
}