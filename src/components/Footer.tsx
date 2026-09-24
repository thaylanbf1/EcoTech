import { Link } from "react-router-dom";
import { ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { PERGUNTAS_FREQUENTES } from "../consts/faq";

const Footer = () => {
  return (
    <footer className="w-full bg-eco-blue px-6 py-10 mt-16 md:mt-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-sora text-lg font-black text-eco-cream-light">
            EcoTech
          </p>
          <p className="font-inter mt-1 text-sm text-white/70">
            Engenharia de Software na Amazônia
          </p>
        </div>

        {/* FAQ (RF12) — <details> já abre/fecha sozinho e é acessível por
            teclado; "group-open" gira a seta quando o item está aberto. */}
        <div id="faq" className="w-full md:max-w-sm">
          <p className="font-sora text-sm font-bold text-eco-cream-light">
            Perguntas frequentes
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {PERGUNTAS_FREQUENTES.map((item) => (
              <details
                key={item.pergunta}
                className="group rounded-lg bg-white/5 px-3 py-2"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-inter text-sm text-white/90 [&::-webkit-details-marker]:hidden">
                  {item.pergunta}
                  <ChevronDown
                    size={14}
                    className="shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="font-inter mt-2 text-xs text-white/70">
                  {item.resposta}{" "}
                  {item.link && (
                    <Link
                      to={item.link.to}
                      className="font-bold text-eco-green hover:opacity-80"
                    >
                      {item.link.label} →
                    </Link>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 font-inter text-sm text-white/90">
          <span className="flex items-center gap-2">
            <Mail size={16} />
            contato@ecotech.com.br
          </span>
          <span className="flex items-center gap-2">
            <Phone size={16} />
            (91) 0000-0000
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={16} />
            UEPA — Campus Ananindeua, Pará
          </span>
        </div>
      </div>

      <p className="font-inter mt-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EcoTech. Todos os direitos reservados.
      </p>
    </footer>
  );
};

export default Footer;