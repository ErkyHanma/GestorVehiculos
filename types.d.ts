import { Ionicons } from "@expo/vector-icons";

export interface Feature {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}

export interface NewsItem {
  id: number;
  titulo: string;
  resumen: string;
  imagenUrl: string;
  fecha: string;
  fuente: string;
  link: string;
}
