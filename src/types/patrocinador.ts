interface Patrocinador {
    nome: string
}

export const master: Patrocinador = {nome: "Patrocinador Master"}

export const ouro: Patrocinador[] = [
    {nome: 'Patrocinador Ouro 01'},
    {nome: 'Patrocinador Ouro 02'},
    {nome: 'Patrocinador Ouro 03'},
]

export const prata: Patrocinador[] = [
    {nome: 'Patrocinador Prata 01'},
    {nome: 'Patrocinador Prata 02'},
    {nome: 'Patrocinador Prata 03'},
    {nome: 'Patrocinador Prata 04'},
    {nome: 'Patrocinador Prata 05'},
]

export type tamanho = 'normal' | 'big'