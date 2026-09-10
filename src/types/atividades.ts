export type TipoAtividade = "Palestra" | "Minicurso" | "Intervalo";

export type dias = 1 | 2

export interface Atividade {
  dia: dias;
  horario: string;
  atividade: string;
  palestrante: string;
  local: string;
  tipo: TipoAtividade;
}

