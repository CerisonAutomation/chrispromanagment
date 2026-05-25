interface TopPropertiesTableProps {
  data: Array<{ id: string; title: string; revenue: number }>;
}

export default function TopPropertiesTable({ data }: TopPropertiesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Property</th>
            <th className="text-left p-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/50">
              <td className="p-2">{item.title}</td>
              <td className="p-2">€{item.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
