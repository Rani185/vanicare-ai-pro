import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  Volume2,
  Gauge,
  Thermometer,
  HeartPulse,
  Activity,
  Zap,
} from 'lucide-react';
import { useApp, computeRiskExport } from '../store';
import { DIALECTS, SCENARIO_PRESETS } from '../data';
import type { Dialect, Vitals } from '../types';
import { playChime, speakHindi } from '../lib';

// Simulated dialect speech lines for "Simulate Dialect Audio"
const SIM_SPEECH: Record<string, string> = {
  Bhojpuri:
    'ka hua ba babu, chhati mein dard ba, saans nahi aawat, kal se pareshan ba',
  Maithili:
    'babuji, teen din se bukhar ba, aankh peechhe dard, deh hath tutait',
  Magahi:
    'daktar sahab, pait mein dard aur chakkar, saat mahina ke garbh ba',
  Hindi:
    'doctor sahab, do din se zukam aur khansi hai, halka bukhar bhi',
  'Indian English':
    'doctor, I have had chest pain and breathlessness since morning',
};

interface SpeechRecognitionEventLike {
  results: { 0: { transcript: string } }[];
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export default function VoiceTriageKiosk() {
  const { addPatient, phc } = useApp();
  const [dialect, setDialect] = useState<Dialect>('Bhojpuri');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'M' | 'F' | 'O'>('M');
  const [abha, setAbha] = useState('');
  const [vitals, setVitals] = useState<Vitals>({
    spo2: 97,
    tempF: 98.6,
    bpSys: 120,
    bpDia: 80,
    pulse: 80,
  });
  const [simulating, setSimulating] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const risk = computeRiskExport(vitals);

  // Setup web speech API
  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = 'hi-IN';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e: SpeechRecognitionEventLike) => {
        let txt = '';
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        setTranscript(txt);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const startListening = useCallback(() => {
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(true);
      }
    } else {
      // Fallback: no SR support, just mark listening and let simulate work
      setListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setListening(false);
  }, []);

  const simulateDialect = useCallback(() => {
    stopListening();
    setTranscript('');
    setSimulating(true);
    const full = SIM_SPEECH[dialect] ?? SIM_SPEECH.Hindi;
    const words = full.split(' ');
    let i = 0;
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    simTimerRef.current = setInterval(() => {
      if (i >= words.length) {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        setSimulating(false);
        // speak the dialect line
        speakHindi(full);
        return;
      }
      setTranscript((prev) => (prev ? prev + ' ' : '') + words[i]);
      i++;
    }, 240);
  }, [dialect, stopListening]);

  const applyPreset = (idx: number) => {
    const p = SCENARIO_PRESETS[idx];
    setDialect(p.dialect);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setAbha(p.abhaId);
    setVitals(p.vitals);
    setTranscript(p.vernacularQuote);
  };

  const dispatch = () => {
    if (!name.trim()) {
      setName('Unnamed Patient');
    }
    const finalName = name.trim() || 'Unnamed Patient';
    const finalAbha = abha.trim() || `ABHA-91-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`;
    const presetMatch = SCENARIO_PRESETS.find((p) => p.name === finalName);
    addPatient({
      name: finalName,
      age,
      gender,
      abhaId: finalAbha,
      dialect,
      vernacularQuote: transcript || '(no voice input)',
      englishSummary: presetMatch?.englishSummary ?? 'Clinical summary pending — review vernacular input.',
      vitals,
      riskScore: risk.score,
      severity: risk.severity,
      village: presetMatch?.village ?? 'Unknown',
      ward: presetMatch?.ward ?? 'Ward-00',
    });
    playChime();
    // reset
    setTranscript('');
    setName('');
    setAbha('');
    setVitals({ spo2: 97, tempF: 98.6, bpSys: 120, bpDia: 80, pulse: 80 });
  };

  const severityColor =
    risk.severity === 'critical'
      ? 'from-red-500 to-red-600 text-white'
      : risk.severity === 'priority'
        ? 'from-amber-400 to-amber-500 text-white'
        : 'from-emerald-400 to-emerald-500 text-white';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
      <div className="teal-gradient px-5 py-4 flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-white" />
        <div>
          <h2 className="font-display font-bold text-white text-base">Vernacular Voice Kiosk</h2>
          <p className="text-teal-50 text-xs">Speak in your dialect — AI transcribes & triages</p>
        </div>
      </div>

      <div className="p-5 space-y-4 scrollbar-thin">
        {/* Dialect selector */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Dialect</label>
          <div className="flex flex-wrap gap-1.5">
            {DIALECTS.map((d) => (
              <button
                key={d}
                onClick={() => setDialect(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  dialect === d
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/30'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Waveform + capture */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-center gap-1 h-20 mb-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all ${
                  listening || simulating ? 'bg-teal-500 animate-waveform' : 'bg-slate-300'
                }`}
                style={{
                  height: listening || simulating ? `${20 + Math.abs(Math.sin(i * 0.7)) * 48}px` : '6px',
                  animationDelay: `${i * 0.06}s`,
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition ${
                listening
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/30'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-500/30'
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {listening ? 'Stop Capture' : 'Start Voice Capture'}
            </button>
            <button
              onClick={simulateDialect}
              disabled={simulating}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50 transition disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              {simulating ? 'Typing…' : 'Simulate Dialect Audio'}
            </button>
          </div>

          {/* Transcript */}
          <div className="mt-3 min-h-[60px] rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
            {transcript ? (
              <span className="animate-fadeIn">{transcript}</span>
            ) : (
              <span className="text-slate-400 italic">
                {listening ? 'Listening… speak now' : 'Transcript will appear here'}
              </span>
            )}
            {(listening || simulating) && (
              <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        </div>

        {/* Scenario presets */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            One-Click Clinical Scenarios
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENARIO_PRESETS.map((p, i) => {
              const sev =
                p.vitals.spo2 < 92 || p.vitals.tempF > 103
                  ? 'critical'
                  : p.vitals.spo2 < 95 || p.vitals.tempF > 102
                    ? 'priority'
                    : 'routine';
              return (
                <button
                  key={i}
                  onClick={() => applyPreset(i)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition group"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sev === 'critical' ? 'bg-red-500' : sev === 'priority' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-teal-700">{p.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug truncate">
                    {p.name}, {p.age}{p.gender} · SpO₂ {p.vitals.spo2}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient identity */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Patient Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="input"
            />
          </Field>
          <Field label="ABHA ID">
            <input
              value={abha}
              onChange={(e) => setAbha(e.target.value)}
              placeholder="ABHA-91-xxxx-xxxx-xxxx"
              className="input"
            />
          </Field>
          <Field label="Age">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Gender">
            <div className="flex gap-1">
              {(['M', 'F', 'O'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                    gender === g ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Vitals */}
        <div className="rounded-xl border border-slate-200 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vitals</span>
            <span className="text-[11px] text-slate-400">SpO₂ &lt;94% or Temp &gt;102°F boosts risk</span>
          </div>

          <VitalSlider
            icon={Activity}
            label="SpO₂"
            unit="%"
            min={70}
            max={100}
            value={vitals.spo2}
            onChange={(v) => setVitals({ ...vitals, spo2: v })}
            danger={vitals.spo2 < 94}
          />
          <VitalSlider
            icon={Thermometer}
            label="Temperature"
            unit="°F"
            min={95}
            max={106}
            step={0.1}
            value={vitals.tempF}
            onChange={(v) => setVitals({ ...vitals, tempF: v })}
            danger={vitals.tempF > 102}
          />
          <div className="grid grid-cols-2 gap-3">
            <VitalSlider
              icon={Gauge}
              label="BP Systolic"
              unit="mmHg"
              min={80}
              max={220}
              value={vitals.bpSys}
              onChange={(v) => setVitals({ ...vitals, bpSys: v })}
              danger={vitals.bpSys > 160}
            />
            <VitalSlider
              icon={Gauge}
              label="BP Diastolic"
              unit="mmHg"
              min={50}
              max={130}
              value={vitals.bpDia}
              onChange={(v) => setVitals({ ...vitals, bpDia: v })}
              danger={vitals.bpDia > 100}
            />
          </div>
          <VitalSlider
            icon={HeartPulse}
            label="Pulse"
            unit="bpm"
            min={40}
            max={160}
            value={vitals.pulse}
            onChange={(v) => setVitals({ ...vitals, pulse: v })}
            danger={vitals.pulse > 110}
          />
        </div>

        {/* Risk score + dispatch */}
        <div className={`rounded-xl bg-gradient-to-br ${severityColor} p-4 flex items-center gap-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
              <Zap className="w-3.5 h-3.5" /> AI Risk Score
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display font-extrabold text-3xl tabular-nums">{risk.score}</span>
              <span className="text-sm font-semibold opacity-90">/ 100</span>
              <span className="text-xs font-bold uppercase ml-1 px-2 py-0.5 rounded-md bg-white/25">
                {risk.severity}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${risk.score}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={dispatch}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
        >
          <Send className="w-4 h-4" />
          Analyze & Dispatch to Doctor Queue
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Dispatching from <span className="font-semibold text-slate-500">{phc}</span> · red cases pinned to top
        </p>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          background: white;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function VitalSlider({
  icon: Icon,
  label,
  unit,
  min,
  max,
  step = 1,
  value,
  onChange,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Icon className={`w-3.5 h-3.5 ${danger ? 'text-red-500' : 'text-teal-600'}`} />
          {label}
        </span>
        <span className={`text-sm font-bold tabular-nums ${danger ? 'text-red-600' : 'text-slate-800'}`}>
          {value}
          <span className="text-[10px] font-medium text-slate-400 ml-0.5">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={danger ? { background: '#fecaca' } : undefined}
      />
    </div>
  );
}
