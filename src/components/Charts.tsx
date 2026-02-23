import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import { MonthlyData } from '../types';

interface ProfileChartProps {
  data: number[];
  title: string;
}

export function ProfileChart({ data, title }: ProfileChartProps) {
  const chartData = data.map((val, i) => ({ hour: i, value: val }));

  return (
    <div className="w-full h-[200px]">
      <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="hour" fontSize={10} tick={{ fill: '#64748b' }} />
          <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(label) => `Hora: ${label}:00`}
          />
          <Area type="monotone" dataKey="value" stroke="#00458d" fill="#00458d" fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BalanceChartProps {
  consProfile: number[];
  genProfile: number[];
  monthlyCons: number;
  kwp: number;
  avgYield: number;
  lossFactor: number;
}

export function BalanceChart({ consProfile, genProfile, monthlyCons, kwp, avgYield, lossFactor }: BalanceChartProps) {
  const sumProfile = consProfile.reduce((a, b) => a + b, 0);
  const pCalc = sumProfile > 0 ? consProfile.map(v => v / sumProfile) : consProfile;
  
  const chartData = Array.from({ length: 24 }).map((_, i) => {
    const consumption = (monthlyCons / 30) * pCalc[i];
    const generation = (kwp * avgYield * lossFactor / 30) * genProfile[i];
    return {
      hour: i,
      consumption: Number(consumption.toFixed(2)),
      generation: Number(generation.toFixed(2)),
      autoconsumption: Number(Math.min(consumption, generation).toFixed(2)),
      surplus: Number(Math.max(0, generation - consumption).toFixed(2))
    };
  });

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="hour" fontSize={10} tick={{ fill: '#64748b' }} />
          <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
          <Tooltip 
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             labelFormatter={(label) => `Hora: ${label}:00`}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Area type="monotone" dataKey="consumption" name="Consumo (kWh)" stroke="#00458d" fill="#00458d" fillOpacity={0.05} />
          <Area type="monotone" dataKey="generation" name="Generación (kWh)" stroke="#f9d423" fill="#f9d423" fillOpacity={0.1} />
          <Area type="monotone" dataKey="autoconsumption" name="Autoconsumo" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBillChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="w-full h-[250px] mt-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Facturación Mensual Estimada</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="mes" fontSize={10} tick={{ fill: '#64748b' }} />
          <YAxis fontSize={10} tick={{ fill: '#64748b' }} />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Factura']}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="bill" fill="#00458d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
