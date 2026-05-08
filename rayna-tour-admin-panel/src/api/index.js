import axios from "axios";
import { API_BASE_URL, TOKEN_KEY } from "../config/appConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const extractError = (error) => {
  return error?.response?.data?.message || "Something went wrong. Please try again.";
};

export const apiService = {
  async login(payload) {
    try {
      const { data } = await api.post("/auth/login", payload);
      return data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async getDashboardMeta() {
    try {
      const [categories, cities, products] = await Promise.all([
        api.get("/categories"),
        api.get("/cities"),
        api.get("/products?limit=1"),
      ]);

      return {
        categoryCount: categories.data?.data?.length || 0,
        cityCount: cities.data?.data?.length || 0,
        productCount: products.data?.meta?.totalItems || 0,
      };
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async listResource(resourcePath) {
    try {
      const { data } = await api.get(resourcePath);
      return data.data || [];
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async createResource(resourcePath, payload) {
    try {
      const { data } = await api.post(resourcePath, payload);
      return data.data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async updateResource(resourcePath, id, payload) {
    try {
      const { data } = await api.patch(`${resourcePath}/${id}`, payload);
      return data.data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async deleteResource(resourcePath, id) {
    try {
      await api.delete(`${resourcePath}/${id}`);
      return true;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async listProducts(params = {}) {
    try {
      const { data } = await api.get("/products", { params });
      return { items: data.data || [], meta: data.meta || {} };
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async createProduct(payload) {
    try {
      const { data } = await api.post("/products", payload);
      return data.data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async updateProduct(id, payload) {
    try {
      const { data } = await api.patch(`/products/${id}`, payload);
      return data.data;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await uploadApi.post("/uploads/image", formData);
      const payload = data.data;
      if (Array.isArray(payload)) return payload[0] || null;
      return payload || null;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },

  async deleteImage(publicId) {
    try {
      await api.delete("/uploads/image", { data: { publicId } });
      return true;
    } catch (error) {
      throw new Error(extractError(error));
    }
  },
};
