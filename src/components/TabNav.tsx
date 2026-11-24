import { Mic, FileText, BarChart3 } from 'lucide-react';
import { useApp } from '../store';
import type { TabId } from '../types';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'triage', label: 'Voice Triage & Doctor Queue', icon: Mic },
  { id: 'prescription', label: 'E-Prescription Studio', icon: FileText },
  { id: 'analytics', label: 'PHC Analytics & Outbreak', icon: BarChart3 },
];

export default function TabNav() {
  const { activeTab, setActiveTab, patients } = useApp();
  const queueCount = patients.filter((p) => p.status === 'waiting').length;

  return (
    <div className="sticky top-[65px] z-30 glass border-b border-slate-200/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex gap-1 py-2 overflow-x-auto scrollbar-thin">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition relative ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.id === 'triage' && queueCount > 0 && (
                  <span
                    className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {queueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
