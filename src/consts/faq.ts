export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
  link?: { to: string; label: string };
}

export const PERGUNTAS_FREQUENTES: PerguntaFrequente[] = [
  {
    pergunta: "Quando e onde acontece o evento?",
    resposta:
      "Nos dias 15 e 16 de outubro, das 9h às 15h45, na UEPA — Campus Ananindeua, Rod. BR-316.",
    link: { to: "/local", label: "Ver local" },
  },
  {
    pergunta: "Como faço minha inscrição?",
    resposta:
      "Pelo formulário oficial de inscrição. Depois de enviar, você recebe um e-mail de confirmação.",
    link: { to: "/inscricao", label: "Ver passo a passo" },
  },
  {
    pergunta: "O evento é acessível?",
    resposta:
      "Sim. Há intérpretes de Libras, rampas de acesso e teclados ampliados, entre outros recursos. Informe sua necessidade no momento da inscrição.",
    link: { to: "/acessibilidade", label: "Ver acessibilidade" },
  },
];
