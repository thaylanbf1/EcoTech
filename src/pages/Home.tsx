import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";
import logoEco from '../assets/exo_logo_branca.png'

const data_do_evento = '2026-10-15T09:00:00'

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-eco-blue pb-40 pt-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center">
            <div>
                <div>
                 <span className="inline-flex items-center mr-2 gap-2 rounded-full border-2 border-white/20 bg-white/10 px-5 py-2 text-sm font-extrabold">
                    <MapPin size={16} />
                    Ananindeua, Pará
                </span>

                <span className="inline-flex items-center gap-2 ml-2 rounded-full border-2 border-white/20 bg-white/10 px-5 py-2 text-sm font-extrabold">
                    15 a 16 de Outubro
                </span>

                </div>

                <h1 className="font-sora mt-8 text-xl font-extrabold leading-tight lg:text-4xl">
                    Primeiro Encontro de tecnologia pensado a partir da{" "}
                    <span className="text-eco-green">Amazônia</span>
                </h1>

                <p className="font-sora mt-6 max-w-xl text-lg text-eco-cream-light">
                    Dois dias de palestras, minicurso e trocas entre estudantes,
                    pesquisadores e profissionais que constroem tecnologia na região
                    — e para ela.
                </p>

                <div className="mt-8">
                    <button
                    onClick={() => navigate("/cronograma")}
                    className="rounded-full border-2 border-white bg-transparent px-8 py-3 font-sora text-lg font-bold text-white hover:text-eco-green cursor-pointer"
                    >
                    Ver Programação
                    </button>
                </div>

            </div>

            <div className="hidden flex-col items-center justify-center gap-8 lg:flex">
                <img src={logoEco} alt="" className="w-72 h-72" />
                <Countdown targetDate={data_do_evento} variant="dark" />
            </div>
            <svg
            className="absolute bottom-0 left-0 h-32 w-full text-eco-cream"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
        >
            <path
            fill="currentColor"
            d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
            />
        </svg>
        </div>

    </section>
  )
}

export default Home