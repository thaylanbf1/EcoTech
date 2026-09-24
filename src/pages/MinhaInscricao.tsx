import { CalendarDays, MapPin } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function MinhaInscricao() {
  const { usuario } = useAuth()

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="font-sora text-sm font-extrabold uppercase tracking-widest text-eco-green-dark">
          Minha inscrição
        </p>
        <h1 className="font-sora mt-4 text-3xl font-bold text-eco-blue sm:text-4xl">
          Olá, {usuario?.nome}!
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Sua inscrição no EcoTech está confirmada com o e-mail{" "}
          <span className="font-bold">{usuario?.email}</span>.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            to="/cronograma"
            className="flex items-start gap-4 rounded-2xl border-2 border-eco-blue/15 bg-white p-6 hover:border-eco-blue"
          >
            <CalendarDays className="shrink-0 text-eco-blue" />
            <div>
              <h2 className="font-sora font-bold text-eco-blue">Cronograma</h2>
              <p className="font-sora mt-1 text-sm text-eco-gray">
                15 e 16 de outubro, das 9h às 15h45.
              </p>
            </div>
          </Link>
          <Link
            to="/local"
            className="flex items-start gap-4 rounded-2xl border-2 border-eco-blue/15 bg-white p-6 hover:border-eco-blue"
          >
            <MapPin className="shrink-0 text-eco-blue" />
            <div>
              <h2 className="font-sora font-bold text-eco-blue">Local</h2>
              <p className="font-sora mt-1 text-sm text-eco-gray">
                UEPA — Campus Ananindeua.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
