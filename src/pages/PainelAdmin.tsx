import { useAuth } from "../hooks/useAuth"

export default function PainelAdmin() {
  const { usuario } = useAuth()

  return (
    <section className="min-h-[70vh] bg-eco-cream px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="font-sora text-sm font-extrabold uppercase tracking-widest text-eco-green-dark">
          Painel do administrador
        </p>
        <h1 className="font-sora mt-4 text-3xl font-bold text-eco-blue sm:text-4xl">
          Bem-vindo(a), {usuario?.nome}
        </h1>
        <p className="font-sora mt-4 text-lg text-eco-gray">
          Área restrita da organização do EcoTech.
        </p>

        <div className="mt-10 rounded-3xl border-2 border-dashed border-eco-blue/30 bg-white p-10 text-center">
          <p className="font-sora text-eco-gray">
            As ferramentas de gestão (inscritos, palestras, exposições) serão
            exibidas aqui quando a API estiver disponível.
          </p>
        </div>
      </div>
    </section>
  )
}
