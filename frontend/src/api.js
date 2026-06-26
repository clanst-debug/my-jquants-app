import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
})

export async function fetchStock(code, date) {
  try {
    const params = { code }
    if (date) params.date = date
    const res = await client.get('/api/stock', { params })
    return res.data
  } catch (err) {
    console.error('fetchStock error', err)
    throw new Error(err.response?.data?.detail || '株価データの取得に失敗しました')
  }
}

export async function fetchFins(code) {
  try {
    const res = await client.get('/api/fins', { params: { code } })
    return res.data
  } catch (err) {
    console.error('fetchFins error', err)
    throw new Error(err.response?.data?.detail || '財務データの取得に失敗しました')
  }
}

export async function fetchAiComment(code, stockData, finsData) {
  try {
    const res = await client.post('/api/ai-comment', {
      code,
      stock_data: stockData,
      fins_data: finsData,
    })
    return res.data
  } catch (err) {
    console.error('fetchAiComment error', err)
    throw new Error(err.response?.data?.detail || 'AIコメントの生成に失敗しました')
  }
}
