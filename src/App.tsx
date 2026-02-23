import { useState, useEffect } from 'react';
import { Sun, MapPin, Settings, TrendingUp, Calculator, Info, Zap, DollarSign } from 'lucide-react';
import MapSelector from './components/MapSelector';
import ProfileEditor from './components/ProfileEditor';
import { BalanceChart, MonthlyBillChart } from './components/Charts';
import { DetailedTable, ScenarioTable } from './components/Tables';
import { PERFIL_RES_PRED, PERFIL_IND_PRED, PERFIL_GEN_SOLAR } from './constants';
import { fetchPVGISData, executeSimulation, findNetZero } from './services/solarService';
import { ScenarioResult } from './types';

export default function App() {
  // 1. Project Data
  const [monthlyCons, setMonthlyCons] = useState(2500);
  const [lat, setLat] = useState(6.24);
  const [lon, setLon] = useState(-75.58);
  const [yields, setYields] = useState<number[] | null>(null);
  const [isLoadingYields, setIsLoadingYields] = useState(false);

  // 2. Profile
  const [profile, setProfile] = useState([...PERFIL_RES_PRED]);

  // 3. Financial/Technical
  const [cu, setCu] = useState(859.19);
  const [costG, setCostG] = useState(280.04);
  const [costC, setCostC] = useState(113.66);
  const [losses, setLosses] = useState(20);

  // 4. Manual Adjustment
  const [manualKwp, setManualKwp] = useState(10);
  const [manualResults, setManualResults] = useState<ScenarioResult | null>(null);
  const [netZeroResults, setNetZeroResults] = useState<ScenarioResult | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const loadPVGIS = async () => {
    setIsLoadingYields(true);
    const data = await fetchPVGISData(lat, lon);
    setYields(data);
    setIsLoadingYields(false);
  };

  const calculateScenarios = (kwp: number, title: string, isNetZero = false) => {
    if (!yields) return;
    const fPerd = 1 - (losses / 100);
    
    // Main simulation for the specific kWp
    const mainSim = executeSimulation(kwp, monthlyCons, yields, fPerd, profile, cu, costC, costG);
    
    // Comparison Scenarios
    const sinSolar = executeSimulation(0, monthlyCons, yields, fPerd, profile, cu, costC, costG);
    const uso4Horas = executeSimulation((monthlyCons / 30) / 4.0, monthlyCons, yields, fPerd, profile, cu, costC, costG);
    
    // Net Zero for typical profiles (if auto_calc_all was true in Python)
    const kInd = findNetZero(PERFIL_IND_PRED, monthlyCons, yields, fPerd, cu, costC, costG);
    const kRes = findNetZero(PERFIL_RES_PRED, monthlyCons, yields, fPerd, cu, costC, costG);
    
    const indSim = executeSimulation(kInd, monthlyCons, yields, fPerd, PERFIL_IND_PRED, cu, costC, costG);
    const resSim = executeSimulation(kRes, monthlyCons, yields, fPerd, PERFIL_RES_PRED, cu, costC, costG);

    const scenarioList = [
      { name: `Sistema ${title}`, kwp: kwp, coverage: mainSim.coverage, annualCost: mainSim.totalAnnualCost },
      { name: "Sin Solar", kwp: 0, coverage: 0, annualCost: sinSolar.totalAnnualCost },
      { name: "Uso 4 Horas Sol", kwp: (monthlyCons / 30) / 4.0, coverage: uso4Horas.coverage, annualCost: uso4Horas.totalAnnualCost },
      { name: "Industrial Típico", kwp: kInd, coverage: indSim.coverage, annualCost: indSim.totalAnnualCost },
      { name: "Residencial Típico", kwp: kRes, coverage: resSim.coverage, annualCost: resSim.totalAnnualCost }
    ];

    setScenarios(scenarioList);
    
    const result: ScenarioResult = {
      name: title,
      kwp,
      coverage: mainSim.coverage,
      annualCost: mainSim.totalAnnualCost,
      monthlyData: mainSim.monthlyData
    };

    if (isNetZero) setNetZeroResults(result);
    else setManualResults(result);
  };

  const handleNetZero = () => {
    if (!yields) return;
    const fPerd = 1 - (losses / 100);
    const nzKwp = findNetZero(profile, monthlyCons, yields, fPerd, cu, costC, costG);
    calculateScenarios(nzKwp, "Optimizado", true);
  };

  const handleManual = () => {
    calculateScenarios(manualKwp, "Manual", false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-maslight-blue text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-maslight-yellow p-2 rounded-lg">
              <Sun className="w-8 h-8 text-maslight-blue" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MasLight Solar</h1>
              <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold">Dashboard V4.3</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="https://www.maslightsolar.com" target="_blank" className="hover:text-maslight-yellow transition-colors">Sitio Web</a>
            <div className="h-4 w-px bg-blue-400/30"></div>
            <span className="text-blue-200">Simulador CREG 174</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Section 1: Project Data */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-maslight-blue" />
            <h2 className="text-lg font-bold text-slate-800">1: Datos del Proyecto</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Consumo Mensual (kWh/Mes)</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={monthlyCons}
                    onChange={(e) => setMonthlyCons(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-maslight-blue focus:border-maslight-blue outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Latitud</label>
                  <input type="number" value={lat.toFixed(4)} readOnly className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Longitud</label>
                  <input type="number" value={lon.toFixed(4)} readOnly className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
              </div>
              <button
                onClick={loadPVGIS}
                disabled={isLoadingYields}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isLoadingYields ? (
                  <>Consultando...</>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    {yields ? "✅ Datos Cargados" : "Cargar Ubicación (API PVGIS)"}
                  </>
                )}
              </button>
              {yields && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Rendimientos mensuales cargados exitosamente para la ubicación seleccionada.
                </div>
              )}
            </div>
            <MapSelector lat={lat} lon={lon} onChange={(lt, ln) => { setLat(lt); setLon(ln); setYields(null); }} />
          </div>
        </section>

        {/* Section 2: Profile Editor */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-maslight-blue" />
            <h2 className="text-lg font-bold text-slate-800">2: Editor de Perfil de Consumo</h2>
          </div>
          <ProfileEditor profile={profile} onChange={setProfile} />
        </section>

        {/* Section 3: Financial Parameters */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-maslight-blue" />
            <h2 className="text-lg font-bold text-slate-800">3: Parámetros Financieros y Técnicos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">CU ($/kWh)</label>
              <input type="number" value={cu} onChange={(e) => setCu(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-maslight-blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Venta G ($/kWh)</label>
              <input type="number" value={costG} onChange={(e) => setCostG(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-maslight-blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Venta C ($/kWh)</label>
              <input type="number" value={costC} onChange={(e) => setCostC(Number(e.target.value))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-maslight-blue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Pérdidas (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="40" value={losses} onChange={(e) => setLosses(Number(e.target.value))} className="flex-1 accent-maslight-blue" />
                <span className="text-sm font-bold text-maslight-blue w-8">{losses}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Net Zero */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-maslight-blue" />
            <h2 className="text-lg font-bold text-slate-800">4: Cálculo Net-Zero (Ideal)</h2>
          </div>
          <button
            onClick={handleNetZero}
            disabled={!yields}
            className="w-full btn-secondary flex items-center justify-center gap-2 mb-6"
          >
            <Calculator className="w-5 h-5" />
            Calcular Net-Zero
          </button>
          
          {netZeroResults && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Potencia Ideal</p>
                  <p className="text-2xl font-bold text-maslight-blue">{netZeroResults.kwp.toFixed(1)} kWp</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Cobertura Solar</p>
                  <p className="text-2xl font-bold text-yellow-600">{netZeroResults.coverage.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Costo Anual</p>
                  <p className="text-2xl font-bold text-slate-800">${netZeroResults.annualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              
              <ScenarioTable scenarios={scenarios} />
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800">Balance Horario Promedio: Optimizado</h3>
                <BalanceChart 
                  consProfile={profile} 
                  genProfile={PERFIL_GEN_SOLAR} 
                  monthlyCons={monthlyCons} 
                  kwp={netZeroResults.kwp} 
                  avgYield={yields ? yields.reduce((a, b) => a + b, 0) / 12 : 0} 
                  lossFactor={1 - (losses / 100)} 
                />
              </div>

              <DetailedTable data={netZeroResults.monthlyData} kwp={netZeroResults.kwp} />
              <MonthlyBillChart data={netZeroResults.monthlyData} />
            </div>
          )}
        </section>

        {/* Section 5: Manual Adjustment */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-maslight-blue" />
            <h2 className="text-lg font-bold text-slate-800">5: Ajuste Manual</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-600 mb-2">Potencia kWp: {manualKwp.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.5"
                value={manualKwp}
                onChange={(e) => setManualKwp(Number(e.target.value))}
                className="w-full accent-maslight-blue"
              />
            </div>
            <button
              onClick={handleManual}
              disabled={!yields}
              className="w-full md:w-auto btn-primary whitespace-nowrap px-8"
            >
              Ejecutar Manual
            </button>
          </div>

          {manualResults && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Potencia Seleccionada</p>
                  <p className="text-2xl font-bold text-maslight-blue">{manualResults.kwp.toFixed(1)} kWp</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Cobertura Solar</p>
                  <p className="text-2xl font-bold text-yellow-600">{manualResults.coverage.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Costo Anual</p>
                  <p className="text-2xl font-bold text-slate-800">${manualResults.annualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800">Balance Horario Promedio: Manual</h3>
                <BalanceChart 
                  consProfile={profile} 
                  genProfile={PERFIL_GEN_SOLAR} 
                  monthlyCons={monthlyCons} 
                  kwp={manualResults.kwp} 
                  avgYield={yields ? yields.reduce((a, b) => a + b, 0) / 12 : 0} 
                  lossFactor={1 - (losses / 100)} 
                />
              </div>

              <DetailedTable data={manualResults.monthlyData} kwp={manualResults.kwp} />
              <MonthlyBillChart data={manualResults.monthlyData} />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-maslight-blue p-2 rounded-lg">
              <Sun className="w-6 h-6 text-maslight-yellow" fill="currentColor" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">© 2026 MasLight Solar. Todos los derechos reservados.</p>
          <p className="text-slate-400 text-xs mt-2">Basado en normatividad CREG 174 para Colombia.</p>
        </div>
      </footer>
    </div>
  );
}
