import { ofetch } from "ofetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  onRequest({ options }) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const headers = new Headers(options.headers);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        options.headers = headers;
      }
    }
  },
  onResponse({ response }) {
    if (typeof window !== "undefined" && response._data) {
      const data = response._data;
      const token = data?.data?.accessToken || data?.accessToken;
      if (token && typeof token === "string") {
        localStorage.setItem("accessToken", token);
      }
    }
  },
});

export default apiClient;

