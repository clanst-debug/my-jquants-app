export default function AiComment({ comment, loading, onGenerate, disabled }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-slate-800">AI コメント</h3>
        <button
          onClick={onGenerate}
          disabled={disabled || loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {loading ? '生成中…' : 'AIコメントを生成'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-slate-300 border-t-sky-600 animate-spin" />
          Claude が分析中…
        </div>
      )}

      {!loading && comment && (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
          {comment}
        </div>
      )}

      {!loading && !comment && (
        <div className="text-slate-500 text-sm py-2">
          ボタンを押すと、株価と財務データをもとに AI が分析コメントを生成します。
        </div>
      )}
    </div>
  )
}
