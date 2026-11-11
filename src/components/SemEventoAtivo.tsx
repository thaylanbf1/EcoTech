import { Link } from "react-router-dom"

// Home quando o admin encerrou o evento e ainda não abriu outro (RF23)
export default function SemEventoAtivo() {
  return (
    <>
      <section className="rounded-b-[3rem] bg-eco-blue px-6 pb-20 pt-16 text-white sm:rounded-b-[5rem] sm:pb-24 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="font-inter rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Sem evento ativo</span>
          <h1 className="font-sora mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Nenhum evento no momento
          </h1>
          <p className="font-inter mt-5 max-w-md text-base text-white/90">
            O próximo encontro ainda não foi divulgado. Enquanto isso, você pode conhecer os eventos que já
            aconteceram.
          </p>
          <Link
            to="/eventos-anteriores"
            className="font-inter mt-6 rounded-full border-[1.5px] border-white px-6 py-2.5 text-sm font-bold hover:bg-white/10"
          >
            Ver eventos anteriores
          </Link>
        </div>
      </section>
      <p className="font-inter px-6 py-16 text-center text-sm text-eco-gray">Novos eventos serão anunciados nesta página.</p>
    </>
  )
}
