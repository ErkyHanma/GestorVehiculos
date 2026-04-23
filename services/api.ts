import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

export const forgetPassword = async (studentId: string) => {
  try {
    const body = new URLSearchParams();
    body.append("datax", JSON.stringify({ matricula: studentId }));

    const response = await fetch(`${API_URL}auth/olvidar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Account activation failed");
    }

    return data;
  } catch (error) {
    console.error("Account activation error:", error);
    throw error instanceof Error
      ? error
      : new Error("Account activation failed");
  }
};

export const changePassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de autenticación.");
  }

  try {
    const body = new URLSearchParams();
    body.append(
      "datax",
      JSON.stringify({ actual: currentPassword, nueva: newPassword }),
    );

    const response = await fetch(`${API_URL}auth/cambiar-clave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Account activation failed");
    }
  } catch (error) {
    console.error("Account activation error:", error);
    throw error instanceof Error
      ? error
      : new Error("Account activation failed");
  }
};

export const refreshToken = async () => {
  const token = await AsyncStorage.getItem("refreshToken");

  if (!token) {
    throw new Error("No se encontró el token de autenticación.");
  }

  try {
    const body = new URLSearchParams();
    body.append("datax", JSON.stringify({ refreshToken }));

    const response = await fetch(`${API_URL}auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Token refresh failed");
    }

    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error instanceof Error ? error : new Error("Token refresh failed");
  }
};

export const getCurrentUser = async () => {
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}perfil`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const getNews = async () => {
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}noticias`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const getNewsById = async (id: number) => {
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}noticias/detalle?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const getVideos = async () => {
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}videos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const getCommunitySubjects = async ({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) => {
  const token = await AsyncStorage.getItem("token");

  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const queryString = params.toString();

  try {
    const response = await fetch(`${API_URL}foro/temas?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching community subjects:", error);
    throw error;
  }
};

export const getCommunitySubjectById = async (id: number) => {
  const token = await AsyncStorage.getItem("token");

  const params = new URLSearchParams();
  if (id) params.append("id", id.toString());

  const queryString = params.toString();

  try {
    const response = await fetch(`${API_URL}foro/detalle?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching community subjects:", error);
    throw error;
  }
};

export const getVehicles = async ({
  marca,
  modelo,
  anio,
  precioMin,
  precioMax,
  page,
  limit,
}: {
  marca?: string;
  modelo?: string;
  anio?: number;
  precioMin?: number;
  precioMax?: number;
  page?: number;
  limit?: number;
}) => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de autenticación.");
  }

  const params = new URLSearchParams();
  if (marca) params.append("marca", marca);
  if (modelo) params.append("modelo", modelo);
  if (anio) params.append("anio", anio.toString());
  if (precioMin) params.append("precioMin", precioMin.toString());
  if (precioMax) params.append("precioMax", precioMax.toString());
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString();

  try {
    const response = await fetch(`${API_URL}catalogo?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

export const getVehicleId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");

  const params = new URLSearchParams();
  if (id) params.append("id", id.toString());

  const queryString = params.toString();

  try {
    const response = await fetch(`${API_URL}catalogo/detalle?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    throw error;
  }
};
