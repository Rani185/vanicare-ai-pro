import { useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../store';

export default function AnalyticsTab() {
  const { patients } = useApp();

  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter((p) => p.severity === 'critical').length;
    const consulted = patients.filter((p) => p.status === 'consulted').length;
    const referred = patients.filter((p) => p.status === 'referred').length;
    const timeSaved = (total * 4.3).toFixed(1);
    return { total, critical, consulted, referred, timeSaved };
  }, [patients]);

  const dialectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      counts[p.dialect] = (counts[p.dialect] ?? 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    return counts;
  }, [patients]);

  const wardBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; fever: number }> = {};
    patients.forEach((p) => {
      if (!counts[p.ward]) counts[p.ward] = { total: 0, fever: 0 };
      counts[p.ward].total++;
      if (p.vitals.tempF > 100.4) counts[p.ward].fever++;
    });
    return counts;
  }, [patients]);

  const severityBreakdown = useMemo(() => {
    const c = { critical: 0, priority: 0, routine: 0 };
    patients.forEach((p) => c[p.severity]++);
    const total = Math.max(patients.length, 1);
    return {
      critical: { n: c.critical, pct: (c.critical / total) * 100 },
      priority: { n: c.priority, pct: (c.priority / total) * 100 },
      routine: { n: c.routine, pct: (c.routine / total) * 100 },
    };
  }, [patients]);

  const dialectColors: Record<string, string> = {
    Bhojpuri: 'bg-teal-500',
    Maithili: 'bg-sky-500',
    Magahi: 'bg-amber-500',
    Hindi: 'bg-violet-500',
    'Indian English': 'bg-emerald-500',
  };

  const maxDialect = Math.max(...Object.values(dialectBreakdown), 1);
  const maxWard = Math.max(...Object.values(wardBreakdown).map((w) => w.total), 1);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Users}
          label="Total Triaged Today"
          value={stats.total}
          tone="teal"
          sub="across all dialects"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Critical Red Flags"
          value={stats.critical}
          tone="red"
          sub="auto-pinned to top"
        />
        <KpiCard
          icon={Clock}
          label="Avg Time Saved"
          value={stats.timeSaved}
          suffix="min"
          tone="amber"
          sub="4.3 min / patient"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Consultations Done"
          value={stats.consulted}
          tone="emerald"
          sub={`${stats.referred} referred to ICU`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Dialect usage bar chart */}
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Dialect Usage Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Patient intake by vernacular dialect</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-3 pt-2">
            {Object.entries(dialectBreakdown).map(([d, n]) => (
              <div key={d}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">{d}</span>
                  <span className="text-xs font-bold tabular-nums text-slate-700">{n}</span>
                </div>
                <div className="h-6 rounded-lg bg-slate-50 overflow-hidden relative">
                  <div
                    className={`h-full ${dialectColors[d] ?? 'bg-slate-400'} rounded-lg transition-all duration-700 flex items-center justify-end pr-2 animate-barGrow origin-bottom`}
                    style={{ width: `${(n / maxDialect) * 100}%` }}
                  >
                    {n > 0 && (
                      <span className="text-[10px] font-bold text-white tabular-nums">{n}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(dialectBreakdown).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No data yet</p>
            )}
          </div>
        </div>

        {/* Severity donut */}
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                Triage Severity Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live breakdown of risk categories</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart
              segments={[
                { value: severityBreakdown.critical.n, color: '#ef4444', label: 'Critical' },
                { value: severityBreakdown.priority.n, color: '#f59e0b', label: 'Priority' },
                { value: severityBreakdown.routine.n, color: '#10b981', label: 'Routine' },
              ]}
              total={patients.length}
            />
            <div className="space-y-2.5 flex-1">
              <LegendRow color="bg-red-500" label="Critical" n={severityBreakdown.critical.n} pct={severityBreakdown.critical.pct} />
              <LegendRow color="bg-amber-400" label="Priority" n={severityBreakdown.priority.n} pct={severityBreakdown.priority.pct} />
              <LegendRow color="bg-emerald-500" label="Routine" n={severityBreakdown.routine.n} pct={severityBreakdown.routine.pct} />
            </div>
          </div>
        </div>
      </div>

      {/* Village outbreak tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Village-Level Symptom Outbreak Tracker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Fever clusters by ward — alerts when ≥2 fever cases</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(wardBreakdown).map(([ward, data]) => {
            const isAlert = data.fever >= 2;
            return (
              <div
                key={ward}
                className={`rounded-xl border p-3.5 transition ${
                  isAlert
                    ? 'border-red-300 bg-red-50/50 card-shadow animate-fadeIn'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {ward}
                  </span>
                  {isAlert && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500 text-white animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      Cluster Alert
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <div>
                    <span className="font-display font-extrabold text-2xl tabular-nums text-slate-800">{data.total}</span>
                    <span className="text-xs text-slate-500 ml-1">cases</span>
                  </div>
                  <div>
                    <span className={`font-display font-bold text-lg tabular-nums ${isAlert ? 'text-red-600' : 'text-amber-500'}`}>
                      {data.fever}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">fever</span>
                  </div>
                </div>
                {/* mini bar */}
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isAlert ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${(data.total / maxWard) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(wardBreakdown).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6 col-span-full">No ward data yet</p>
          )}
        </div>
        {/* Highlighted fever cluster callout */}
        {Object.entries(wardBreakdown).some(([, d]) => d.fever >= 2) && (
          <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-800 font-medium">
              <span className="font-bold">Outbreak detected:</span>{' '}
              {Object.entries(wardBreakdown)
                .filter(([, d]) => d.fever >= 2)
                .map(([w]) => w)
                .join(', ')}{' '}
              — elevated fever cases flagged for district surveillance team.
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer footer */}
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-slate-100 border border-slate-200 text-center justify-center">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-600">Clinical Decision Support System</span> — Final diagnosis and
          treatment must be verified by a licensed physician.
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
  tone: 'teal' | 'red' | 'amber' | 'emerald';
  sub?: string;
}) {
  const tones = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  }[tone];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4 hover:card-shadow-lg transition group">
      <div className={`w-9 h-9 rounded-lg ${tones.bg} flex items-center justify-center mb-2.5 ring-4 ${tones.ring} group-hover:scale-110 transition`}>
        <Icon className={`w-4.5 h-4.5 ${tones.text}`} />
      </div>
      <div className="font-display font-extrabold text-2xl text-slate-900 tabular-nums leading-none animate-countUp">
        {value}
        {suffix && <span className="text-sm font-bold text-slate-400 ml-1">{suffix}</span>}
      </div>
      <div className="text-xs font-semibold text-slate-600 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function LegendRow({ color, label, n, pct }: { color: string; label: string; n: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      <span className="text-sm font-bold tabular-nums text-slate-800">{n}</span>
      <span className="text-xs text-slate-400 tabular-nums w-12 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

function DonutChart({ segments, total }: { segments: { value: number; color: string; label: string }[]; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const safeTotal = Math.max(total, 1);
  let offset = 0;
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((s, i) => {
          const len = (s.value / safeTotal) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-2xl tabular-nums text-slate-800">{total}</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
      </div>
    </div>
  );
}
