import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

// Union type dos rótulos exibidos nos botões de filtro.
type Filtro = "Todos" | "Artigos" | "Pôsteres" | "Projetos";

const FILTROS: Filtro[] = ["Todos", "Artigos", "Pôsteres", "Projetos"];

// Union type das categorias reais salvas em cada trabalho (note que
// "Artigos" no filtro é plural, mas aqui é singular — por isso existe o
// mapeamento FILTRO_PARA_CATEGORIA abaixo).
type Categoria = "Artigo" | "Projeto" | "Pôster";

// Mapeia cada filtro para a categoria real usada nos dados. `null`
// representa "sem filtro" (mostrar tudo). O tipo `Record<Filtro, ...>`
// garante que todo valor de Filtro tenha uma entrada aqui.
const FILTRO_PARA_CATEGORIA: Record<Filtro, Categoria | null> = {
  Todos: null,
  Artigos: "Artigo",
  Pôsteres: "Pôster",
  Projetos: "Projeto",
};

const CORES_TAG: Record<Categoria, string> = {
  Artigo: "bg-esa-blue",
  Projeto: "bg-[#008660]",
  Pôster: "bg-esa-green",
};

interface Trabalho {
  categoria: Categoria;
  titulo: string;
  autores: string;
}

const TRABALHOS: Trabalho[] = [
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

export default function Exposicoes() {
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("Todos");

  const categoriaFiltro = FILTRO_PARA_CATEGORIA[filtroAtivo];

  // Se a categoria do filtro for null (opção "Todos"), mostramos tudo;
  // senão, comparamos com a categoria de cada trabalho.
  const trabalhosFiltrados = TRABALHOS.filter(
    (t) => categoriaFiltro === null || t.categoria === categoriaFiltro
  );

  return (
    <section className="min-h-[70vh] bg-esa-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-esa-blue lg:text-5xl">
          Exposições
        </h1>
        <p className="font-sora mt-4 text-lg text-esa-gray">
          Confira os trabalhos, artigos e projetos apresentados durante o
          evento.
        </p>

        {/* Botões de filtro */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
        {FILTROS.map((filtro) => {
            const ativo = filtroAtivo === filtro;
            return (
            <button
                key={filtro}
                onClick={() => setFiltroAtivo(filtro)}
                className={`rounded-full px-6 py-2 font-sora text-sm font-bold transition-colors duration-200 ${
                ativo
                    ? "text-white shadow-sm"
                    : "border-[1.5px] border-esa-blue text-esa-blue hover:bg-esa-blue/10"
                }`}
                style={ativo ? { backgroundColor: "#0B4F9E" } : undefined}
            >
                {filtro}
            </button>
            );
        })}
        </div>

        {/* Grid de cards — re-renderiza automaticamente sempre que
            "trabalhosFiltrados" muda, porque o array vem de "filter"
            aplicado a "filtroAtivo" (estado). */}
        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {trabalhosFiltrados.map((t) => (
            <article
              key={t.titulo}
              className="rounded-2xl border border-gray-300 bg-white p-3"
            >
              <div className="relative flex h-[140px] items-center justify-center rounded-xl bg-[#ebf0f7]">
                <span
                  className={`absolute left-3 top-3 rounded-pill px-3 py-1 text-[11px] font-bold text-white ${
                    CORES_TAG[t.categoria]
                  }`}
                >
                  {t.categoria}
                </span>
                <ImageIcon className="text-[#c7d4e5]" size={40} />
                <span className="ml-2 text-xs font-bold text-esa-gray-light">
                  BANNER
                </span>
              </div>

              <h3 className="font-sora mt-4 text-base font-bold text-esa-blue">
                {t.titulo}
              </h3>
              <p className="mt-1 text-xs text-esa-gray">{t.autores}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
