import ProductSection from "../components/ProductSection";
import { useDashboardData } from "../hooks/useDashboardData";

const ProductsPage = () => {
  const { categories, cities, subCategories, tourTypes, loading, error } = useDashboardData();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">Products</h2>
        <p className="text-sm text-surface-600">
          Create and manage product catalog, pricing, and content.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <div className="card p-6 text-sm text-surface-600">Loading lookups...</div>
      ) : (
        <ProductSection
          categories={categories}
          cities={cities}
          subCategories={subCategories}
          tourTypes={tourTypes}
        />
      )}
    </section>
  );
};

export default ProductsPage;
