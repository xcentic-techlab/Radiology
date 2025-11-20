import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  
});




instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  console.log("REQUEST URL:", config.baseURL + config.url);
  console.log("ENV API URL:", import.meta.env.VITE_API_URL);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
