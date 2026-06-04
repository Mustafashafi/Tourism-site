import ResourceSection from "../components/ResourceSection";

const CategoriesPage = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">Categories</h2>
        <p className="text-sm text-surface-600">Manage tour categories.</p>
      </div>
      <ResourceSection
        title="Category Management"
        resourcePath="/categories"
        enableBanner
      />
    </section>
  );
};

export default CategoriesPage;
