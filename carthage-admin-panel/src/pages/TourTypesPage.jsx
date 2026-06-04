import ResourceSection from "../components/ResourceSection";

const TourTypesPage = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">Tour Types</h2>
        <p className="text-sm text-surface-600">Manage tour types hierarchy.</p>
      </div>
      <ResourceSection
        title="Tour Type Management"
        resourcePath="/tour-types"
      />
    </section>
  );
};

export default TourTypesPage;
