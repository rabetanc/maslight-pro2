import { MonthlyData, SimulationResult } from '../types';
import { PERFIL_GEN_SOLAR, MONTHS } from '../constants';

export async function fetchPVGISData(lat: number, lon: number): Promise<number[] | null> {
  // Ahora usamos nuestra propia ruta configurada en vercel.json
  const url = `/api/pvgis?lat=${lat}&lon=${lon}&peakpower=1&loss=14&outputformat=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en servidor');
    
    const data = await response.json();

    if (data && data.outputs && data.outputs.monthly) {
      return data.outputs.monthly.map((month: any) => month.E_m);
    }
    return null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export function executeSimulation(
  kwp: number,
  monthlyCons: number,
  yields: number[],
  lossFactor: number,
  consProfile: number[],
  cu: number,
  costC: number,
  costG: number
): SimulationResult {
  let totalAnnualCost = 0;
  const monthlyData: MonthlyData[] = [];
  
  const sumProfile = consProfile.reduce((a, b) => a + b, 0);
  const pCalc = sumProfile > 0 ? consProfile.map(v => v / sumProfile) : consProfile;
  const dailyConsH = pCalc.map(v => (monthlyCons / 30) * v);

  yields.forEach((rendM, i) => {
    const dailyGenH = PERFIL_GEN_SOLAR.map(v => (kwp * rendM * lossFactor / 30) * v);
    
    const mGen = dailyGenH.reduce((a, b) => a + b, 0) * 30;
    const mAuto = dailyConsH.reduce((acc, cons, idx) => acc + Math.min(cons, dailyGenH[idx]), 0) * 30;
    const mExcTot = dailyGenH.reduce((acc, gen, idx) => acc + Math.max(0, gen - dailyConsH[idx]), 0) * 30;
    const mImpRed = dailyConsH.reduce((acc, cons, idx) => acc + Math.max(0, cons - dailyGenH[idx]), 0) * 30;

    const s1 = Math.min(mExcTot, mImpRed);
    const s2 = Math.max(0, mExcTot - mImpRed);
    const mFactura = (mImpRed * cu) - (s1 * (cu - costC)) - (s2 * costG);

    totalAnnualCost += mFactura;
    monthlyData.push({
      mes: MONTHS[i],
      gen: mGen,
      auto: mAuto,
      red: mImpRed,
      exc: mExcTot,
      s1,
      s2,
      bill: mFactura
    });
  });

  const totalGen = monthlyData.reduce((a, b) => a + b.gen, 0);
  const coverage = (monthlyCons > 0) ? (totalGen / (monthlyCons * 12)) * 100 : 0;

  return {
    totalAnnualCost,
    monthlyData,
    kwp,
    coverage
  };
}

export function findNetZero(
  profile: number[],
  monthlyCons: number,
  yields: number[],
  lossFactor: number,
  cu: number,
  costC: number,
  costG: number
): number {
  for (let t = 0.5; t <= 500.5; t += 0.5) {
    const result = executeSimulation(t, monthlyCons, yields, lossFactor, profile, cu, costC, costG);
    if (result.totalAnnualCost <= 0) return t;
  }
  return 500.0;
}
