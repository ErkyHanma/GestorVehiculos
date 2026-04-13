// Mock data for testing purposes
import { Vehicle, VehicleDetailsType } from "@/types";

export const vehiclesData: Vehicle[] = [
  {
    id: 1,
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2022,
    precio: 22000,
    descripcionCorta: "Sedán confiable, eficiente y cómodo para el día a día.",
    imagenUrl: "https://picsum.photos/seed/corolla/400/300",
  },
  {
    id: 2,
    marca: "Honda",
    modelo: "Civic",
    anio: 2023,
    precio: 25000,
    descripcionCorta:
      "Diseño moderno con excelente rendimiento de combustible.",
    imagenUrl: "https://picsum.photos/seed/civic/400/300",
  },
  {
    id: 3,
    marca: "Ford",
    modelo: "Explorer",
    anio: 2021,
    precio: 38000,
    descripcionCorta: "SUV espaciosa ideal para familias y viajes largos.",
    imagenUrl: "https://picsum.photos/seed/explorer/400/300",
  },
  {
    id: 4,
    marca: "BMW",
    modelo: "X5",
    anio: 2024,
    precio: 65000,
    descripcionCorta: "Lujo, potencia y tecnología en un solo vehículo.",
    imagenUrl: "https://picsum.photos/seed/bmwx5/400/300",
  },
  {
    id: 5,
    marca: "Hyundai",
    modelo: "Tucson",
    anio: 2022,
    precio: 29000,
    descripcionCorta: "SUV versátil con gran relación calidad-precio.",
    imagenUrl: "https://picsum.photos/seed/tucson/400/300",
  },
];

export const vehicleDetails: VehicleDetailsType[] = [
  {
    id: 1,
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2022,
    precio: 22000,
    imagenes: [
      "https://picsum.photos/seed/corolla1/800/600",
      "https://picsum.photos/seed/corolla2/800/600",
      "https://picsum.photos/seed/corolla3/800/600",
    ],
    descripcion:
      "El Toyota Corolla 2022 ofrece una conducción suave, excelente consumo de combustible y alta confiabilidad, ideal para uso urbano y viajes largos.",
    especificaciones: {
      motor: "1.8L 4 cilindros",
      potencia: "139 hp",
      transmision: "Automática CVT",
      combustible: "Gasolina",
      consumo: "6.7 L/100km",
    },
  },
  {
    id: 2,
    marca: "Honda",
    modelo: "Civic",
    anio: 2023,
    precio: 25000,
    imagenes: [
      "https://picsum.photos/seed/civic1/800/600",
      "https://picsum.photos/seed/civic2/800/600",
    ],
    descripcion:
      "El Honda Civic 2023 combina estilo deportivo con tecnología avanzada y gran eficiencia de combustible.",
    especificaciones: {
      motor: "2.0L 4 cilindros",
      potencia: "158 hp",
      transmision: "Automática",
      combustible: "Gasolina",
      consumo: "7.1 L/100km",
    },
  },
  {
    id: 3,
    marca: "Ford",
    modelo: "Explorer",
    anio: 2021,
    precio: 38000,
    imagenes: [
      "https://picsum.photos/seed/explorer1/800/600",
      "https://picsum.photos/seed/explorer2/800/600",
    ],
    descripcion:
      "La Ford Explorer es una SUV robusta con gran capacidad interior, perfecta para familias y aventuras.",
    especificaciones: {
      motor: "2.3L EcoBoost",
      potencia: "300 hp",
      transmision: "Automática de 10 velocidades",
      combustible: "Gasolina",
      traccion: "AWD",
    },
  },
  {
    id: 4,
    marca: "BMW",
    modelo: "X5",
    anio: 2024,
    precio: 65000,
    imagenes: [
      "https://picsum.photos/seed/bmwx51/800/600",
      "https://picsum.photos/seed/bmwx52/800/600",
    ],
    descripcion:
      "El BMW X5 ofrece lujo premium, tecnología avanzada y un desempeño excepcional en carretera.",
    especificaciones: {
      motor: "3.0L Turbo",
      potencia: "335 hp",
      transmision: "Automática",
      combustible: "Gasolina",
      interior: "Cuero premium",
    },
  },
];
