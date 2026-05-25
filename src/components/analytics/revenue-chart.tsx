import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{ date: string; amount: number }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
        <Bar dataKey="amount" fill="#8884d8" name="Revenue (€)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
