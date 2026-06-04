import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Failed to fetch homepage data.";

export const homeApi = {
  async getCategories() {
    try {
      const { data } = await api.get("/categories");
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Fetches all categories and flattens their banners into carousel slide objects.
   * If allowedSlugs is provided, only fetches banners for those category slugs.
   * Each slide: { url, title, subtext, description, categoryName, categorySlug }
   */
  async getBannerSlides(allowedSlugs = []) {
    try {
      const { data } = await api.get("/categories");
      const categories = data?.data || [];
      const slides = [];
      for (const cat of categories) {
        if (allowedSlugs && allowedSlugs.length > 0) {
          if (!allowedSlugs.includes(cat.slug.toLowerCase())) continue;
        }
        const banners = Array.isArray(cat.banners) ? cat.banners : [];
        for (const banner of banners) {
          const rawUrl = typeof banner === "string" ? banner : banner?.url;
          if (!rawUrl) continue;
          let url = rawUrl;
          if (!/^(http|https|data|blob):/.test(rawUrl)) {
            const baseUrl = API_BASE_URL.replace(/\/api$/, "");
            url = `${baseUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
          }
          slides.push({
            url,
            title: banner?.title || cat.name || "",
            subtext: banner?.subtext || "",
            description: banner?.description || "",
            categoryName: cat.name,
            categorySlug: cat.slug,
          });
        }
      }
      return slides;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProductsGroupedByCity(categoryId) {
    try {
      const { data } = await api.get(`/products/grouped/category/${categoryId}`);
      return data?.data || { category: null, groupedByCity: [] };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProductBySlug(slug) {
    try {
      const { data } = await api.get(`/products/slug/${slug}`);
      return data?.data || null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getCities() {
    try {
      const { data } = await api.get("/cities");
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProducts(params = {}) {
    try {
      const { data } = await api.get("/products", { params });
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getSubCategories(params = {}) {
    try {
      const { data } = await api.get("/sub-categories", { params });
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTourTypes() {
    try {
      const { data } = await api.get("/tour-types");
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getNavigationHierarchy() {
    try {
      const { data } = await api.get("/products/navigation-hierarchy");
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTestimonials() {
    try {
      const { data } = await api.get("/testimonials");
      return data?.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getSettings() {
    try {
      const { data } = await api.get("/settings");
      return data?.data || null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

