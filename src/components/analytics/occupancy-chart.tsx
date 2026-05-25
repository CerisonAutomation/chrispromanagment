import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OccupancyChartProps {
  data: Array<{ date: string; rate: number }>;
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis unit="%" />
        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
        <Line type="monotone" dataKey="rate" stroke="#82ca9d" name="Occupancy Rate" />
      </LineChart>
    </ResponsiveContainer>
  );
}
