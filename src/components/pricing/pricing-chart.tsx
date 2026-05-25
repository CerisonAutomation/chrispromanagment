import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricingChartProps {
  data: Array<{ date: string; price: number; occupancy_probability: number }>;
}

export default function PricingChart({ data }: PricingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          name="Price (€)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="occupancy_probability"
          stroke="#82ca9d"
          name="Occupancy Probability"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
