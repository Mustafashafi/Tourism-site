import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import OverviewPage from "./pages/OverviewPage";
import CategoriesPage from "./pages/CategoriesPage";
import CitiesPage from "./pages/CitiesPage";
import SubCategoriesPage from "./pages/SubCategoriesPage";
import TourTypesPage from "./pages/TourTypesPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
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
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="cities" element={<CitiesPage />} />
        <Route path="sub-categories" element={<SubCategoriesPage />} />
        <Route path="tour-types" element={<TourTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
