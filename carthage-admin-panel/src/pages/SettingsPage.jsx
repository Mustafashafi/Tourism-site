import SettingsSection from "../components/SettingsSection";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-surface-500">Website Management</p>
        <h2 className="text-xl font-bold text-surface-900">Settings</h2>
      </div>
      <SettingsSection />
    </div>
  );
};

export default SettingsPage;
