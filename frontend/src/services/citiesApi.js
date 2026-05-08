import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Failed to fetch cities.";

export const citiesApi = {
  async getBestCities(category) {
    try {
      const { data } = await api.get("/cities", { params: { category } });
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getCityBySlug(slug) {
    try {
      const { data } = await api.get(`/cities/slug/${slug}`);
      return data?.data || null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getAllCities() {
    try {
      const { data } = await api.get("/cities");
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProductsByCity(cityId, params = {}) {
    try {
      const { data } = await api.get(`/products/city/${cityId}`, { params });
      return {
        products: data?.data || [],
        categories: data?.categories || [],
        meta: data?.meta || {},
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getReviewsByCity(cityId, limit = 20) {
    try {
      const { data } = await api.get(`/reviews/city/${cityId}`, { params: { limit } });
      return {
        reviews: data?.data || [],
        stats: data?.stats || { avgRating: 0, totalReviews: 0 },
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
