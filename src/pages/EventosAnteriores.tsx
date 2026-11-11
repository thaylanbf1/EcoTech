import ListaEventosAnteriores from "../components/ListaEventosAnteriores"

export default function EventosAnteriores() {
  return (
    <>
      <section className="rounded-b-[3rem] bg-eco-blue px-6 pb-16 pt-10 text-white sm:rounded-b-[5rem]">
        <div className="mx-auto max-w-7xl lg:px-2">
          <h1 className="font-sora text-4xl font-extrabold sm:text-5xl lg:text-6xl">Eventos anteriores</h1>
          <p className="font-sora mt-4 max-w-3xl text-lg text-white/90">
            Consulte o que foi definido em cada edição: conteúdo, cores, template e itens do menu.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <ListaEventosAnteriores />
      </section>
    </>
  )
}
