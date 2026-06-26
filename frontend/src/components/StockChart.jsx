import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function extractRows(stockData) {
  if (!stockData) return []
  const rows = stockData.daily_quotes || stockData.prices || []
  return rows
    .map((r) => ({
      date: r.Date,
      close: r.AdjustmentClose ?? r.Close ?? r.AdjClose ?? null,
    }))
    .filter((r) => r.date && r.close != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

export default function StockChart({ stockData }) {
  const rows = extractRows(stockData)

  if (rows.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-8 text-center">
        株価データがありません
      </div>
    )
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="close"
            name="終値"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
