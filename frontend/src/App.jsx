import { useState } from 'react'
import StockSearch from './components/StockSearch.jsx'
import StockChart from './components/StockChart.jsx'
import FinsSummary from './components/FinsSummary.jsx'
import AiComment from './components/AiComment.jsx'
import { fetchStock, fetchFins, fetchAiComment } from './api.js'

export default function App() {
  const [code, setCode] = useState('')
  const [stockData, setStockData] = useState(null)
  const [finsData, setFinsData] = useState(null)
  const [aiComment, setAiComment] = useState('')

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingAi, setLoadingAi] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (nextCode) => {
    setError('')
    setAiComment('')
    setLoadingSearch(true)
    setCode(nextCode)
    try {
      const [stock, fins] = await Promise.all([
        fetchStock(nextCode),
        fetchFins(nextCode),
      ])
      setStockData(stock)
      setFinsData(fins)
    } catch (err) {
      setError(err.message)
      setStockData(null)
      setFinsData(null)
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleGenerateAi = async () => {
    if (!code) return
    setError('')
    setLoadingAi(true)
    try {
      const res = await fetchAiComment(code, stockData, finsData)
      setAiComment(res.comment || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAi(false)
    }
  }

  const canGenerateAi = !!stockData && !!finsData && !loadingSearch

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-lg sm:text-xl font-semibold">
            J-Quants ダッシュボード
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            日本株データ × Claude による分析
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <StockSearch onSearch={handleSearch} loading={loadingSearch} />
          {error && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </section>

        {(stockData || loadingSearch) && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              株価チャート {code && <span className="text-slate-500 text-sm">({code})</span>}
            </h2>
            <StockChart stockData={stockData} />
          </section>
        )}

        {(finsData || loadingSearch) && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-base font-semibold text-slate-800 mb-3">財務サマリー</h2>
            <FinsSummary finsData={finsData} />
          </section>
        )}

        {code && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <AiComment
              comment={aiComment}
              loading={loadingAi}
              onGenerate={handleGenerateAi}
              disabled={!canGenerateAi}
            />
          </section>
        )}
      </main>
    </div>
  )
}
