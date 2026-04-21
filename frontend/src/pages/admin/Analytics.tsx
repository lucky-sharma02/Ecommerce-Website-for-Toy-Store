import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Jul", volume: 12400, users: 34 },
  { month: "Aug", volume: 18200, users: 41 },
  { month: "Sep", volume: 15800, users: 45 },
  { month: "Oct", volume: 22100, users: 52 },
  { month: "Nov", volume: 28900, users: 58 },
  { month: "Dec", volume: 35200, users: 63 },
  { month: "Jan", volume: 31000, users: 67 },
];

export default function AdminAnalytics() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Platform Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border rounded-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Transaction Volume ($)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="volume" fill="hsl(217,71%,25%)" radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Active Users</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="hsl(142,71%,35%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
