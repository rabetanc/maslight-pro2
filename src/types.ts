export interface MonthlyData {
  mes: string;
  gen: number;
  auto: number;
  red: number;
  exc: number;
  s1: number;
  s2: number;
  bill: number;
}

export interface SimulationResult {
  totalAnnualCost: number;
  monthlyData: MonthlyData[];
  kwp: number;
  coverage: number;
}

export interface ScenarioResult {
  name: string;
  kwp: number;
  coverage: number;
  annualCost: number;
  monthlyData: MonthlyData[];
}

export type ProfileType = 'Residencial' | 'Industrial';
