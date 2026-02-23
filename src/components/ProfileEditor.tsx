import { useState, useEffect } from 'react';
import { PERFIL_RES_PRED, PERFIL_IND_PRED } from '../constants';
import { ProfileChart } from './Charts';
import { ProfileType } from '../types';

interface ProfileEditorProps {
  profile: number[];
  onChange: (newProfile: number[]) => void;
}

export default function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const [selectedPreset, setSelectedPreset] = useState<ProfileType>('Residencial');
  const [activeHour, setActiveHour] = useState(12);

  const handlePresetChange = (preset: ProfileType) => {
    setSelectedPreset(preset);
    onChange(preset === 'Residencial' ? [...PERFIL_RES_PRED] : [...PERFIL_IND_PRED]);
  };

  const handleSliderChange = (hour: number, value: number) => {
    const newProfile = [...profile];
    newProfile[hour] = value;
    
    // Normalization logic from Python
    const total = newProfile.reduce((a, b) => a + b, 0);
    if (total === 0) {
      onChange(newProfile);
      return;
    }
    
    const diff = total - 100.0;
    const othersIdx = Array.from({ length: 24 }, (_, i) => i).filter(i => i !== hour);
    const sumOthers = othersIdx.reduce((acc, i) => acc + newProfile[i], 0);
    
    if (sumOthers > 0) {
      othersIdx.forEach(i => {
        const adjustment = (newProfile[i] / sumOthers) * diff;
        newProfile[i] = Math.max(0, newProfile[i] - adjustment);
      });
    }
    
    onChange(newProfile);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600">Preajuste:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['Residencial', 'Industrial'] as ProfileType[]).map((type) => (
            <button
              key={type}
              onClick={() => handlePresetChange(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedPreset === type
                  ? 'bg-white text-maslight-blue shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2">
          <ProfileChart data={profile} title="Tu Perfil de Consumo (%)" />
          <div className="mt-2 text-center text-xs text-slate-400">
            Suma de pesos: {profile.reduce((a, b) => a + b, 0).toFixed(2)}%
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Hora: {activeHour}:00
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={activeHour}
                onChange={(e) => setActiveHour(parseInt(e.target.value))}
                className="w-full accent-maslight-blue"
              />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-bold text-maslight-blue">{profile[activeHour].toFixed(1)}%</span>
              <div className="h-32 w-2 bg-slate-200 rounded-full relative">
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.1"
                  value={profile[activeHour]}
                  onChange={(e) => handleSliderChange(activeHour, parseFloat(e.target.value))}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 -rotate-90 accent-maslight-blue cursor-pointer"
                  style={{ appearance: 'none', background: 'transparent' }}
                />
              </div>
              <span className="text-[10px] text-slate-400 uppercase">Peso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
