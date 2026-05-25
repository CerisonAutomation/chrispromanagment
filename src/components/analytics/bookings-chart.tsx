import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingsChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function BookingsChart({ data }: BookingsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#ffc658" name="Bookings" />
      </BarChart>
    </ResponsiveContainer>
  );
}
