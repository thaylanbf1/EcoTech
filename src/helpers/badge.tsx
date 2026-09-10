import type { TipoAtividade } from "../types/atividades";
import { CORES_TIPO } from "../consts/cronograma";

export interface BadgeProps {
  tipo: TipoAtividade;
}

export  function Badge({ tipo }: BadgeProps) {
  const classes = CORES_TIPO[tipo];
  return (
    <span
      className={`inline-block rounded-full border px-4 py-1 text-xs font-bold ${classes}`}
    >
      {tipo}
    </span>
  );
}