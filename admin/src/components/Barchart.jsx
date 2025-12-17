// src/components/charts/PremiumBarChart.jsx
import React from "react";

const PremiumBarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="h-52 flex items-center justify-center border rounded-xl bg-slate-50 text-xs text-slate-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="h-52 flex items-end gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-gradient-to-b from-slate-50 to-slate-100">
      {data.map((item) => {
        const heightPercent = (item.value / maxValue) * 100;

        return (
          <div
            key={item.day}
            className="flex flex-col items-center justify-end flex-1"
          >
            <div
              className="w-7 rounded-lg bg-gradient-to-t from-indigo-600 via-sky-500 to-cyan-400 shadow-sm shadow-indigo-400/40 flex items-end justify-center transition-all"
              style={{ height: `${heightPercent}%` }}
            >
              <span className="text-[10px] text-white mb-1">{item.value}</span>
            </div>
            <span className="mt-1 text-[11px] text-slate-500">{item.day}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PremiumBarChart;
