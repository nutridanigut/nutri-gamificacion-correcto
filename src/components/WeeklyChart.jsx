import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WEEK_LABELS } from '../utils/date';

export default function WeeklyChart({ data = [] }) {
  const chartData = data.map((v, i) => ({ name: WEEK_LABELS[i], value: v }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#16a34a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
