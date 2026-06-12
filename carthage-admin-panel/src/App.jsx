import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import OverviewPage from "./pages/OverviewPage";
import BookingsPage from "./pages/BookingsPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CitiesPage from "./pages/CitiesPage";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import TourTypesPage from "./pages/TourTypesPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import CmsEditorPage from "./pages/CmsEditorPage";
import LoginPage from "./pages/LoginPage";
import { useEffect } from "react";
import { apiService } from "./api";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    let title = "Carthage Admin Panel";
    if (location.pathname === "/") title = "Carthage Admin - Overview";
    else if (location.pathname.startsWith("/bookings")) title = "Carthage Admin - Bookings";
    else if (location.pathname.startsWith("/customers")) title = "Carthage Admin - Customers";
    else if (location.pathname.startsWith("/reports")) title = "Carthage Admin - Reports";
    else if (location.pathname.startsWith("/categories")) title = "Carthage Admin - Categories";
    else if (location.pathname.startsWith("/cities")) title = "Carthage Admin - Cities";
    else if (location.pathname.startsWith("/sub-categories")) title = "Carthage Admin - Sub Categories";
    else if (location.pathname.startsWith("/tour-types")) title = "Carthage Admin - Tour Types";
    else if (location.pathname.startsWith("/products")) title = "Carthage Admin - Products";
    else if (location.pathname.startsWith("/testimonials")) title = "Carthage Admin - Testimonials";
    else if (location.pathname.startsWith("/cms-editor")) title = "Carthage Admin - CMS Editor";
    else if (location.pathname.startsWith("/settings")) title = "Carthage Admin - Settings";
    else if (location.pathname.startsWith("/login")) title = "Carthage Admin - Login";
    document.title = title;
  }, [location]);

  useEffect(() => {
    apiService.getSettings()
      .then(settings => {
        if (settings?.logos?.favicon) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = settings.logos.favicon;
        }
      })
      .catch(console.error);
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="cities" element={<CitiesPage />} />
        <Route path="sub-categories" element={<SubCategoriesPage />} />
        <Route path="tour-types" element={<TourTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="cms-editor" element={<CmsEditorPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
