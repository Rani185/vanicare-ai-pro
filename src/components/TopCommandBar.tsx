import { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Building2,
  ChevronDown,
  CloudOff,
  Cloud,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { useApp } from '../store';
import { PHCS } from '../data';
import { useClock, formatTime, formatDate } from '../lib';

export default function TopCommandBar() {
  const { phc, setPhc, role, setRole, online, setOnline, toasts, dismissToast } = useApp();
  const now = useClock();
  const [phcOpen, setPhcOpen] = useState(false);
  const phcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (phcRef.current && !phcRef.current.contains(e.target as Node)) setPhcOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 glass card-shadow">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl teal-gradient flex items-center justify-center shadow-lg shadow-teal-500/30">
                <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.4} />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulseRing" />
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 leading-tight tracking-tight">
                VaniCare <span className="text-teal-600">AI</span>
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-teal-700 leading-tight">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                  <CheckCircle2 className="w-3 h-3" /> ABDM & eSanjeevani Integrated
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Activity className="w-3 h-3" /> Live PHC OS
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Clock */}
          <div className="hidden md:flex flex-col items-end leading-tight px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-mono font-semibold text-sm text-slate-800 tabular-nums">{formatTime(now)}</span>
            <span className="text-[10px] text-slate-500">{formatDate(now)}</span>
          </div>

          {/* PHC Selector */}
          <div className="relative" ref={phcRef}>
            <button
              onClick={() => setPhcOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition text-sm font-medium text-slate-700"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline max-w-[180px] truncate">{phc}</span>
              <span className="sm:hidden">PHC</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${phcOpen ? 'rotate-180' : ''}`} />
            </button>
            {phcOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 card-shadow-lg p-1.5 animate-fadeIn z-50">
                {PHCS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPhc(p);
                      setPhcOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                      phc === p ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 opacity-60" />
                    {p}
                    {phc === p && <CheckCircle2 className="w-4 h-4 ml-auto text-teal-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync toggle */}
          <button
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition border ${
              online
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
            title={online ? 'Click to simulate offline mode' : 'Click to sync back online'}
          >
            {online ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              <span className={`block w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping`} />
            </span>
          </button>

          {/* Role switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setRole('asha')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                role === 'asha' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ASHA / Kiosk</span>
              <span className="sm:hidden">ASHA</span>
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                role === 'doctor' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Doctor Command</span>
              <span className="sm:hidden">Doctor</span>
            </button>
          </div>
        </div>

        {/* Offline banner */}
        {!online && (
          <div className="bg-amber-50 border-y border-amber-200 px-4 sm:px-6 py-2 flex items-center gap-2 text-sm text-amber-800 animate-fadeIn">
            <CloudOff className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Offline Queue Active</span>
            <span className="text-amber-700">— Local Storage Sync • patient records will sync when connection returns</span>
          </div>
        )}
      </header>

      {/* Toasts */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>
    </>
  );
}

function Toast({ toast, onDismiss }: { toast: { id: string; message: string; tone: string }; onDismiss: () => void }) {
  const config = {
    success: { icon: CheckCircle2, cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    info: { icon: Info, cls: 'bg-sky-50 border-sky-200 text-sky-800' },
    warning: { icon: AlertTriangle, cls: 'bg-amber-50 border-amber-200 text-amber-800' },
    error: { icon: AlertTriangle, cls: 'bg-red-50 border-red-200 text-red-800' },
  }[toast.tone] ?? { icon: Info, cls: 'bg-slate-50 border-slate-200 text-slate-800' };
  const Icon = config.icon;
  return (
    <div
      className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border card-shadow-lg animate-toastIn ${config.cls}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="opacity-50 hover:opacity-100 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
