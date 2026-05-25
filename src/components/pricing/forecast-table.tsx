interface ForecastTableProps {
  data: Array<{ date: string; price: number; occupancy_probability: number }>;
}

export default function ForecastTable({ data }: ForecastTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Price (€)</th>
            <th className="text-left p-2">Occupancy Probability</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date} className="border-b hover:bg-muted/50">
              <td className="p-2">{item.date}</td>
              <td className="p-2">€{item.price.toFixed(2)}</td>
              <td className="p-2">{(item.occupancy_probability * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
