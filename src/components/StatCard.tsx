import React from "react";

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "purple";
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
  badge,
}) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text} border ${scheme.border}`}
        >
          {icon}
        </div>
      </div>
      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <span className="text-slate-500 font-medium">{subtitle}</span>
          {badge && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
