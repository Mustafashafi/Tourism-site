const StatCard = ({ label, value }) => {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-surface-500">{label}</p>
      <h3 className="mt-2 text-3xl font-semibold text-surface-900">{value}</h3>
    </div>
  );
};

export default StatCard;
