import ResourceSection from "../components/ResourceSection";

const CitiesPage = () => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-surface-900">Cities</h2>
        <p className="text-sm text-surface-600">Manage destination cities.</p>
      </div>
      
      <ResourceSection
        title="City Management"
        resourcePath="/cities"
        enableCityCards
      />
    </section>
  );
};

export default CitiesPage;
