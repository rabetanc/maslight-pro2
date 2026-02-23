import { MonthlyData } from '../types';

export function DetailedTable({ data, kwp }: { data: MonthlyData[], kwp: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-bottom border-slate-200">
          <tr>
            <th className="px-4 py-3">Mes</th>
            <th className="px-4 py-3 text-right">Generación</th>
            <th className="px-4 py-3 text-right">Autoconsumo</th>
            <th className="px-4 py-3 text-right">Desde Red</th>
            <th className="px-4 py-3 text-right">Exc. Tot</th>
            <th className="px-4 py-3 text-right">Exc. T1</th>
            <th className="px-4 py-3 text-right">Exc. T2</th>
            <th className="px-4 py-3 text-right">Factura</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={row.mes} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">{row.mes}</td>
              <td className="px-4 py-3 text-right font-mono">{row.gen.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{row.auto.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{row.red.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{row.exc.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{row.s1.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{row.s2.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-maslight-blue">
                ${row.bill.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScenarioTable({ scenarios }: { scenarios: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-6">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-bottom border-slate-200">
          <tr>
            <th className="px-4 py-3">Escenario</th>
            <th className="px-4 py-3 text-right">Potencia (kWp)</th>
            <th className="px-4 py-3 text-right">Cobertura Solar</th>
            <th className="px-4 py-3 text-right">Costo Anual ($)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {scenarios.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
              <td className="px-4 py-3 text-right font-mono">{s.kwp.toFixed(1)}</td>
              <td className="px-4 py-3 text-right font-mono">{s.coverage.toFixed(1)}%</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                ${s.annualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
