import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  title: string;
  className?: string;
}

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartData {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  value: number;
}

interface CustomPieChartProps extends ChartProps {
  data: PieChartData[];
  colors?: string[];
}

interface CustomBarChartProps extends ChartProps {
  data: BarChartData[];
  color?: string;
}

interface CustomLineChartProps extends ChartProps {
  data: LineChartData[];
  color?: string;
  dataKey?: string;
}

const DEFAULT_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
  "#dda0dd",
  "#98fb98",
];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "8px",
};

export function CustomPieChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  className = "",
}: CustomPieChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length],
  }));

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${((percent || 0) * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomBarChart({
  title,
  data,
  color = "#8884d8",
  className = "",
}: CustomBarChartProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis />
          <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
          <Bar dataKey="value" fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomLineChart({
  title,
  data,
  color = "#8884d8",
  dataKey = "value",
  className = "",
}: CustomLineChartProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Multi-line chart for timeline data
interface TimelineChartProps extends ChartProps {
  data: Array<{
    date: string;
    applications: number;
    interviews: number;
    accepted: number;
  }>;
}

export function TimelineChart({
  title,
  data,
  className = "",
}: TimelineChartProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
          <Legend />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#8884d8"
            strokeWidth={2}
            name="Lamaran"
          />
          <Line
            type="monotone"
            dataKey="interviews"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Wawancara"
          />
          <Line
            type="monotone"
            dataKey="accepted"
            stroke="#ffc658"
            strokeWidth={2}
            name="Diterima"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Funnel chart component
interface FunnelChartProps extends ChartProps {
  data: {
    applied: number;
    interview_scheduled: number;
    interview_completed: number;
    accepted: number;
    conversion_rates: {
      application_to_interview: string;
      interview_to_completion: string;
      completion_to_acceptance: string;
    };
  };
}

export function FunnelChart({ title, data, className = "" }: FunnelChartProps) {
  const funnelData = [
    { name: "Mendaftar", value: data.applied, color: "#8884d8" },
    {
      name: "Wawancara Dijadwalkan",
      value: data.interview_scheduled,
      color: "#82ca9d",
    },
    {
      name: "Wawancara Selesai",
      value: data.interview_completed,
      color: "#ffc658",
    },
    { name: "Diterima", value: data.accepted, color: "#ff7300" },
  ];

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      <div className="space-y-2">
        {funnelData.map((item, index) => {
          const percentage =
            index === 0 ? 100 : (item.value / data.applied) * 100;
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{item.value}</span>
                <span className="text-xs text-gray-500">
                  ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Tingkat Konversi
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            Lamaran → Wawancara:{" "}
            {data.conversion_rates.application_to_interview}
          </div>
          <div>
            Wawancara → Selesai: {data.conversion_rates.interview_to_completion}
          </div>
          <div>
            Selesai → Diterima: {data.conversion_rates.completion_to_acceptance}
          </div>
        </div>
      </div>
    </div>
  );
}
