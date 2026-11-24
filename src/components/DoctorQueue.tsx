import { useState, useMemo } from 'react';
import {
  Search,
  Ambulance,
  FileText,
  Clock,
  MapPin,
  Activity,
  Thermometer,
  Gauge,
  HeartPulse,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../store';
import { timeAgo } from '../lib';
import type { Patient, Severity } from '../types';

const FILTERS: { key: 'all' | Severity; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: 'slate' },
  { key: 'critical', label: 'Critical', color: 'red' },
  { key: 'priority', label: 'Priority', color: 'amber' },
  { key: 'routine', label: 'Routine', color: 'emerald' },
];

export default function DoctorQueue() {
  const { patients, setActivePatientId, setActiveTab, referPatient } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Severity>('all');

  const counts = useMemo(() => {
    const c = { all: patients.length, critical: 0, priority: 0, routine: 0 };
    patients.forEach((p) => c[p.severity]++);
    return c;
  }, [patients]);

  const sortedFiltered = useMemo(() => {
    const rank: Record<Severity, number> = { critical: 0, priority: 1, routine: 2 };
    return patients
      .filter((p) => filter === 'all' || p.severity === filter)
      .filter(
        (p) =>
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.abhaId.toLowerCase().includes(query.toLowerCase()) ||
          p.village.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => {
        if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
        return b.riskScore - a.riskScore;
      });
  }, [patients, filter, query]);

  const openConsult = (p: Patient) => {
    setActivePatientId(p.id);
    setActiveTab('prescription');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900 px-5 py-4 flex items-center gap-3">
        <Stethoscope className="w-5 h-5 text-teal-300" />
        <div className="flex-1">
          <h2 className="font-display font-bold text-white text-base">Doctor Priority Queue</h2>
          <p className="text-slate-400 text-xs">Real-time triage — red cases pinned to top</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {counts.all} active
        </span>
      </div>

      {/* Search + filters */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ABHA ID, or village…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const n = counts[f.key];
            const styles = {
              slate: active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              red: active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
              amber: active ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
              emerald: active ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
            }[f.color];
            const dot = {
              slate: 'bg-slate-400',
              red: 'bg-red-500',
              amber: 'bg-amber-500',
              emerald: 'bg-emerald-500',
            }[f.color];
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${styles}`}
              >
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                {f.label}
                <span className="ml-0.5 tabular-nums opacity-80">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2.5">
        {sortedFiltered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No patients in this view</p>
            <p className="text-xs">Dispatch a case from the voice kiosk to populate the queue</p>
          </div>
        )}
        {sortedFiltered.map((p) => (
          <PatientCard
            key={p.id}
            patient={p}
            onConsult={() => openConsult(p)}
            onRefer={() => referPatient(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PatientCard({
  patient: p,
  onConsult,
  onRefer,
}: {
  patient: Patient;
  onConsult: () => void;
  onRefer: () => void;
}) {
  const sevConfig = {
    critical: {
      ring: 'border-l-red-500',
      badge: 'bg-red-500 text-white',
      glow: 'shadow-red-500/20',
      label: 'Critical',
      dot: 'bg-red-500',
    },
    priority: {
      ring: 'border-l-amber-400',
      badge: 'bg-amber-400 text-white',
      glow: 'shadow-amber-400/20',
      label: 'Priority',
      dot: 'bg-amber-400',
    },
    routine: {
      ring: 'border-l-emerald-400',
      badge: 'bg-emerald-400 text-white',
      glow: 'shadow-emerald-400/20',
      label: 'Routine',
      dot: 'bg-emerald-400',
    },
  }[p.severity];

  const statusBadge = {
    waiting: { label: 'Waiting', cls: 'bg-slate-100 text-slate-600' },
    consulting: { label: 'Consulting', cls: 'bg-sky-100 text-sky-700' },
    consulted: { label: 'Consulted ✔', cls: 'bg-emerald-100 text-emerald-700' },
    referred: { label: 'Referred → ICU', cls: 'bg-red-100 text-red-700' },
  }[p.status];

  const riskColor =
    p.riskScore >= 70 ? 'bg-red-500' : p.riskScore >= 40 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${sevConfig.ring} card-shadow hover:card-shadow-lg transition-all bg-white animate-slideInRight ${sevConfig.glow}`}
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-slate-400">#{p.token}</span>
              <span className="font-display font-bold text-sm text-slate-900 truncate">{p.name}</span>
              <span className="text-[11px] text-slate-400">
                {p.age}{p.gender} · {p.dialect}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
              <FileText className="w-3 h-3" />
              <span className="font-mono">{p.abhaId}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${sevConfig.badge}`}>
              {sevConfig.label}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Risk score bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">AI Risk Score</span>
            <span className="text-xs font-bold tabular-nums text-slate-700">{p.riskScore}/100</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${riskColor} rounded-full transition-all duration-500`}
              style={{ width: `${p.riskScore}%` }}
            />
          </div>
        </div>

        {/* Vernacular quote */}
        <div className="rounded-lg bg-amber-50/60 border border-amber-100 px-2.5 py-2 mb-2">
          <p className="text-xs text-slate-700 italic leading-relaxed">"{p.vernacularQuote}"</p>
        </div>

        {/* English summary */}
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 mb-2.5">
          <p className="text-xs text-slate-600 leading-relaxed">{p.englishSummary}</p>
        </div>

        {/* Vitals pills */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <VitalPill icon={Activity} label="SpO₂" value={`${p.vitals.spo2}%`} danger={p.vitals.spo2 < 94} />
          <VitalPill icon={Thermometer} label="Temp" value={`${p.vitals.tempF}°F`} danger={p.vitals.tempF > 102} />
          <VitalPill
            icon={Gauge}
            label="BP"
            value={`${p.vitals.bpSys}/${p.vitals.bpDia}`}
            danger={p.vitals.bpSys > 160 || p.vitals.bpDia > 100}
          />
          <VitalPill icon={HeartPulse} label="Pulse" value={`${p.vitals.pulse}`} danger={p.vitals.pulse > 110} />
        </div>

        {/* Location + time */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {p.village} · {p.ward}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(p.arrivedAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onConsult}
            disabled={p.status === 'consulted' || p.status === 'referred'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p.status === 'consulted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
            {p.status === 'consulted' ? 'Consulted' : p.status === 'referred' ? 'Referred' : 'Consult & Prescribe'}
          </button>
          {p.severity === 'critical' && p.status === 'waiting' && (
            <button
              onClick={onRefer}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 transition"
            >
              <Ambulance className="w-3.5 h-3.5" />
              108 Referral
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VitalPill({
  icon: Icon,
  label,
  value,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
        danger
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <Icon className={`w-3 h-3 ${danger ? 'text-red-500' : 'text-slate-400'}`} />
      {label} <span className="tabular-nums">{value}</span>
    </span>
  );
}
