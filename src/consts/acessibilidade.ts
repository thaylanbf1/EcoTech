import { Accessibility, Armchair, CircleParking, Ear, HandHelping, Keyboard, Toilet } from "lucide-react";
import interpreteLibras from "../assets/interprete-libras.jpg";
import rampaDeAcesso from "../assets/rampa-de-acesso.jpg";
import tecladoAmpliado from "../assets/teclad0-ampliado-braille-cegos-baixavisao.webp";
import type { CompromissoAcessibilidade, RecursoAcessibilidade } from "../types/acessibilidade";

export const RECURSOS_ACESSIBILIDADE: RecursoAcessibilidade[] = [
  {
    imagem: interpreteLibras,
    alt: "Intérprete de Libras sinalizando ao lado de um professor que explica o conteúdo escrito no quadro verde",
    icon: Ear,
    titulo: "Intérprete de Libras",
    descricao:
      "Todas as palestras e a cerimônia de abertura contam com intérpretes de Língua Brasileira de Sinais posicionados ao lado de quem apresenta, com boa iluminação e visibilidade. As primeiras fileiras ficam reservadas para pessoas surdas e com deficiência auditiva.",
  },
  {
    imagem: rampaDeAcesso,
    alt: "Rampa de acesso com piso metálico antiderrapante e corrimãos duplos de aço na entrada de um prédio",
    icon: Accessibility,
    titulo: "Rampas de acesso",
    descricao:
      "As entradas do auditório, das salas do minicurso e da área de exposições possuem rampas com corrimão duplo e piso antiderrapante, garantindo circulação com autonomia para pessoas em cadeira de rodas ou com mobilidade reduzida.",
  },
  {
    imagem: tecladoAmpliado,
    alt: "Pessoa digitando em um teclado preto com teclas amarelas e letras ampliadas",
    icon: Keyboard,
    titulo: "Teclados ampliados",
    descricao:
      "O laboratório do minicurso prático oferece estações com teclados de teclas ampliadas e alto contraste, além de leitores de tela, para que pessoas cegas ou com baixa visão acompanhem as atividades em igualdade de condições.",
  },
];

export const COMPROMISSOS_ACESSIBILIDADE: CompromissoAcessibilidade[] = [
  { icon: Armchair, label: "Assentos reservados" },
  { icon: Toilet, label: "Banheiros adaptados" },
  { icon: CircleParking, label: "Vagas de estacionamento exclusivas" },
  { icon: HandHelping, label: "Equipe de apoio no local" },
];
