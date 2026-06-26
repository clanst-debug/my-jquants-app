function extractLatest(finsData) {
  if (!finsData) return null
  // J-Quants v2 は { data: [...] } 形式。後方互換として旧キーもフォールバック。
  const rows = finsData.data || finsData.statements || finsData.fins || []
  if (rows.length === 0) return null
  const sorted = [...rows].sort((a, b) =>
    (a.DisclosedDate || '') < (b.DisclosedDate || '') ? 1 : -1,
  )
  return sorted[0]
}

function fmt(value) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return num.toLocaleString('ja-JP')
}

export default function FinsSummary({ finsData }) {
  const latest = extractLatest(finsData)

  if (!latest) {
    return (
      <div className="text-slate-500 text-sm py-4">
        財務データがありません
      </div>
    )
  }

  const cards = [
    { label: '売上高', value: latest.NetSales },
    { label: '営業利益', value: latest.OperatingProfit },
    { label: '純利益', value: latest.Profit },
    { label: '総資産', value: latest.TotalAssets },
  ]

  return (
    <div>
      <div className="text-xs text-slate-500 mb-2">
        開示日: {latest.DisclosedDate || '—'} / 期: {latest.TypeOfCurrentPeriod || '—'}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-xs text-slate-500">{c.label}</div>
            <div className="text-base font-semibold text-slate-800 mt-1">
              {fmt(c.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
