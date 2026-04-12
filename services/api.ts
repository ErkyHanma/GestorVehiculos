import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

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
