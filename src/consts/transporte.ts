import { type LucideIcon, Car, Bus, Footprints, } from "lucide-react";

export interface Transporte {
  icon: LucideIcon;
  label: string;
}

export const TRANSPORTES: Transporte[] = [
  { icon: Car, label: "De carro" },
  { icon: Bus, label: "Transporte público" },
  { icon: Footprints, label: "A pé" },
];
