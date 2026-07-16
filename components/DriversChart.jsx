"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatFa } from "@/lib/goldData";

export default function DriversChart({ items }) {
  return (
    <div className="drivers-chart" role="img" aria-label="سهم عوامل موثر بر بازده طلای ایران">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 2, right: 2, left: 4, bottom: 2 }}>
          <XAxis type="number" hide domain={["dataMin - 3", "dataMax + 3"]} />
          <YAxis type="category" dataKey="name" orientation="right" axisLine={false} tickLine={false} width={88} tick={{ fill: "#6f6a60", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "rgba(183, 138, 50, .06)" }} formatter={(value) => [`${value >= 0 ? "+" : ""}${formatFa(value, 1)}٪`, "اثر بر بازده"]} />
          <Bar dataKey="value" radius={5} maxBarSize={22}>
            {items.map((item) => <Cell key={item.name} fill={item.value >= 0 ? "#b78a32" : "#c85c55"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
