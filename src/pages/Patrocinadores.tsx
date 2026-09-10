// Dados mockados dos patrocinadores. Em um projeto real, isso viria de
// uma API ou de um arquivo JSON/CMS — mas a estrutura do componente
// (mapear um array para cards) seria exatamente a mesma.
interface Patrocinador {
  nome: string;
}

const MASTER: Patrocinador = { nome: "Patrocinador Master" };

const OURO: Patrocinador[] = [
  { nome: "Patrocinador Ouro 01" },
  { nome: "Patrocinador Ouro 02" },
  { nome: "Patrocinador Ouro 03" },
];

const PRATA: Patrocinador[] = [
  { nome: "Patrocinador Prata 01" },
  { nome: "Patrocinador Prata 02" },
  { nome: "Patrocinador Prata 03" },
  { nome: "Patrocinador Prata 04" },
  { nome: "Patrocinador Prata 05" },
];

// Props do componente auxiliar. `size` tem um valor padrão ("normal"),
// então marcamos como opcional (`?`) — quem usa <CardPatrocinador> não
// é obrigado a informar essa prop.
interface CardPatrocinadorProps {
  nome: string;
  size?: "normal" | "big";
}

// Componente pequeno e reutilizável para o "placeholder de logo".
// Extrair este pedaço evita repetir o mesmo JSX em cada card.
function CardPatrocinador({ nome, size = "normal" }: CardPatrocinadorProps) {
  const isBig = size === "big";
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 text-center shadow-sm">
      <div
        className={`flex items-center justify-center rounded-lg bg-[#ebf0f7] text-xs font-bold text-esa-gray-light ${
          isBig ? "h-20" : "h-[50px]"
        }`}
      >
        LOGO
      </div>
      <p className="font-sora mt-3 text-sm font-bold text-esa-blue">{nome}</p>
    </div>
  );
}

export default function Patrocinadores() {
  return (
    <section className="min-h-[70vh] bg-esa-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-esa-blue lg:text-5xl">
          Patrocinadores
        </h1>
        <p className="font-sora mt-4 text-lg text-esa-gray">
          Empresas e instituições que tornam esse encontro possível.
        </p>

        <p className="font-sora mt-14 text-left text-sm font-extrabold tracking-[2px] text-esa-blue">
          PATROCINADORES
        </p>

        {/* Master ocupa uma faixa própria, um pouco maior */}
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-md">
            <CardPatrocinador nome={MASTER.nome} size="big" />
          </div>
        </div>

        {/* Grid responsivo: 1 coluna no celular, 3 em telas médias+ */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {OURO.map((p) => (
            <CardPatrocinador key={p.nome} nome={p.nome} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {PRATA.map((p) => (
            <CardPatrocinador key={p.nome} nome={p.nome} />
          ))}
        </div>
      </div>
    </section>
  );
}
