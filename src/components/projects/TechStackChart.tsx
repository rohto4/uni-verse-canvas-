'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface TechStackChartProps {
  data: Record<string, number>
}

const COLORS = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(168, 85, 247, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(251, 146, 60, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(244, 63, 94, 0.8)',
]

export function TechStackChart({ data }: TechStackChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return null
  }

  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)
  const labels = entries.map(([lang]) => lang)
  const values = entries.map(([, percent]) => percent)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.slice(0, labels.length),
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          font: {
            size: 12,
          },
          generateLabels: (chart: any) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => ({
                text: `${label}: ${data.datasets[0].data[i]}%`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              }))
            }
            return []
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`
          },
        },
      },
    },
  }

  return (
    <div className="w-full h-[300px]">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}
