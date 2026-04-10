import { Ionicons } from "@expo/vector-icons";

export interface Feature {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}