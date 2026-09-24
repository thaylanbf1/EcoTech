import type { LucideIcon } from "lucide-react";

export interface RecursoAcessibilidade {
  imagem: string;
  alt: string;
  icon: LucideIcon;
  titulo: string;
  descricao: string;
}

export interface CompromissoAcessibilidade {
  icon: LucideIcon;
  label: string;
}
