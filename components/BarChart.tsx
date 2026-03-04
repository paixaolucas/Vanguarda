interface BarChartProps {
  data: { label: string; value: number }[]
  formatValue?: (v: number) => string
  height?: number
}

export default function BarChart({ data, formatValue, height = 120 }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((item, i) => {
          const barHeight = Math.max((item.value / max) * height, item.value > 0 ? 4 : 0)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end" style={{ height }}>
                <div
                  className="w-full bg-white/10 group-hover:bg-white/20 transition-colors relative"
                  style={{ height: barHeight }}
                >
                  {item.value > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatValue ? formatValue(item.value) : item.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-white/30 truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
