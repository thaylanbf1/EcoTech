const PARCEIROS: string[] = [
  "Parceiro 01",
  "Parceiro 02",
  "Parceiro 03",
  "Parceiro 04",
  "Parceiro 05",
  "Parceiro 06",
];

export default function Parceiros() {
  return (
    <section className="min-h-[70vh] bg-esa-cream px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="font-sora text-4xl font-bold text-esa-blue lg:text-5xl">
          Parceiros
        </h1>
        <p className="font-sora mt-4 text-lg text-esa-gray">
          Empresas e instituições que tornam esse encontro possível.
        </p>

        <p className="font-sora mt-14 text-left text-sm font-extrabold tracking-[2px] text-esa-blue">
          PARCEIROS
        </p>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PARCEIROS.map((nome) => (
            <div
              key={nome}
              className="rounded-2xl border border-gray-300 bg-white p-4 text-center shadow-sm"
            >
              <div className="flex h-9 items-center justify-center rounded-lg bg-[#ebf0f7] text-xs font-bold text-esa-gray-light">
                LOGO
              </div>
              <p className="font-sora mt-3 text-sm font-bold text-esa-blue">
                {nome}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
