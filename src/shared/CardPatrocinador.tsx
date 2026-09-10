import { type tamanho } from "../types/patrocinador"

interface CardPatrocinador {
    nome: string
    size?: tamanho
}

export function CardPatrocinador({nome, size = 'normal'}: CardPatrocinador) {
    const isBig = size === 'big'
    return (
        <div className="rounded-2xl border border-gray-300 bg-white p-4 text-center shadow-sm">
        <div
            className={`flex items-center justify-center rounded-lg bg-[#ebf0f7] text-xs font-bold text-eco-gray-light ${
            isBig ? "h-20" : "h-12.5"
            }`}
        > 
            LOGO
        </div>
        <p className="font-sora mt-3 text-sm font-bold text-eco-blue">{nome}</p>
        </div>
    )
}