import { useState } from 'react'

export default function StockSearch({ onSearch, loading }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    onSearch(trimmed)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          銘柄コード (5桁、例: 72030)
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="72030"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="rounded-lg bg-sky-600 px-4 py-2 text-white font-medium hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {loading ? '検索中…' : '検索'}
      </button>
    </form>
  )
}
