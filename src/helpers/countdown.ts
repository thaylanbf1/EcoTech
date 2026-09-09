export interface TimeLeft { 
    dias: number
    horas: number
    minutos: number
    segundos: number
}

export function getTimeLeft(targetDate: string):TimeLeft {
    const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    return { dias, horas, minutos, segundos };
}
