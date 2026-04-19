<div align="center">
 
# 🚗 AutoPulse — Sistema Moderno de Gestión Vehicular
 
<div>
  <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
  <img src="https://img.shields.io/badge/-React_Native-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
  <img src="https://img.shields.io/badge/-Expo_54-000020?style=for-the-badge&logo=Expo&logoColor=white" />
  <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white" /> <br/>
  <img src="https://img.shields.io/badge/-Expo_Router-000020?style=for-the-badge&logo=Expo&logoColor=white" />
  <img src="https://img.shields.io/badge/-React_Context-61DAFB?style=for-the-badge&logo=React&logoColor=black" />
  <img src="https://img.shields.io/badge/-Async_Storage-3178C6?style=for-the-badge&logo=Databricks&logoColor=white" />
</div>

</div>

---

## 📖 Descripción General

**AutoPulse** es una aplicación móvil multiplataforma desarrollada con **Expo** y **React Native**, orientada a la gestión integral de vehículos. Su objetivo principal es ofrecer una solución moderna que permita tanto la exploración de un catálogo automotriz como la administración personalizada de vehículos.

La aplicación está diseñada para dos tipos de usuarios:

- Usuarios públicos interesados en explorar vehículos y contenido relacionado.
- Usuarios autenticados que desean gestionar su flota vehicular, mantenimiento y gastos.

Este proyecto forma parte de un desarrollo académico, aplicando buenas prácticas de ingeniería de software, arquitectura modular y consumo de APIs, alineado con los lineamientos de proyectos tecnológicos del ITLA.

---

## 🎯 Objetivos del Proyecto

- Desarrollar una aplicación móvil funcional utilizando tecnologías modernas.
- Implementar autenticación y manejo de sesiones seguras.
- Integrar consumo de APIs REST.
- Aplicar principios de diseño UI/UX enfocados en experiencia de usuario.
- Gestionar información estructurada relacionada a vehículos.

---

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Equipo de Desarrollo](#-equipo-de-desarrollo)
- [Configuración del Entorno](#-configuración-del-entorno)

---

## ✨ Características

### 🌐 Acceso Público

- **Catálogo de Vehículos:** Visualización de vehículos con especificaciones detalladas.
- **Contenido Multimedia:** Integración de videos y noticias del sector automotriz.
- **Perfiles Públicos:** Exploración de información sin necesidad de autenticación.
- **Interacción Comunitaria:** Espacios para compartir opiniones y tendencias.

### 🔐 Área Privada (Usuarios Autenticados)

- **Gestión de Vehículos:** Registro y administración de vehículos personales.
- **Mantenimiento:** Control del historial de servicios realizados.
- **Consumo de Combustible:** Seguimiento de eficiencia y gastos.
- **Gestión de Neumáticos:** Registro de cambios y monitoreo.
- **Control Financiero:** Administración de gastos relacionados a vehículos.
- **Autenticación Segura:** Inicio de sesión, persistencia de sesión y manejo de tokens.

---

## 🏗️ Arquitectura y Tecnologías

| Componente        | Tecnología                  | Descripción                      |
| ----------------- | --------------------------- | -------------------------------- |
| **Framework**     | Expo 54 / React Native      | Desarrollo multiplataforma       |
| **Lenguaje**      | TypeScript                  | Tipado estático                  |
| **Navegación**    | Expo Router                 | Enrutamiento basado en archivos  |
| **Estado Global** | React Context               | Manejo de sesión y autenticación |
| **Persistencia**  | AsyncStorage                | Almacenamiento local             |
| **Estilos**       | StyleSheet                  | Estilos nativos optimizados      |
| **Multimedia**    | Expo Image / YouTube Iframe | Manejo de imágenes y video       |

---

## 👨‍💻 Equipo de Desarrollo

Proyecto desarrollado por los siguientes desarrolladores:

| Nombre                        | Matrícula | Contacto             |
| ----------------------------- | --------- | -------------------- |
| **Yenzel Baez**               | 2024-1824 | 20241824@itla.edu.do |
| **Cristian Emmanuel Pacheco** | 2024-2016 | 20242016@itla.edu.do |

---

## ⚙️ Configuración de Desarrollo Local <a id="local-development-setup"></a>

 

### Prerrequisitos

 

- [Node.js](https://nodejs.org/) (v18+)
- Aplicación [Expo Go](https://expo.dev/go) en tu dispositivo móvil (opcional, para pruebas físicas)

 

### Configuración

 
Crea un archivo `.env` en la raíz del proyecto para definir tu API de backend:

 

```env
EXPO_PUBLIC_API_URL=[https://your-api-endpoint.com](https://your-api-endpoint.com)
```

---

### 1. Instalar dependencias

```bash
npm install
```

---

### 2. Iniciar la aplicación

```bash
# Start development server
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web
```
