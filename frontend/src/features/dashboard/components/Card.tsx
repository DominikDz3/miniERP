interface Props {
  label: string;
  value: string;
  hint?: string;
}

export function Card({ label, value, hint }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}