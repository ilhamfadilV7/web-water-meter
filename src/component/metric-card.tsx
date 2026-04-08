interface Props {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}

export default function MetricCard({ title, value, change, positive }: Props) {
  return (
    <div className="bg-[#1E293B] rounded-xl p-6 text-white shadow">
      <p className="text-sm text-gray-400">{title}</p>

      <div className="flex items-center justify-between mt-2">
        <h2 className="text-2xl font-bold">{value}</h2>

        <span
          className={`text-sm font-medium ${
            positive ? "text-green-400" : "text-red-400"
          }`}>
          {change}
        </span>
      </div>
    </div>
  );
}
