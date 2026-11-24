import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Volume2,
  Square,
  Printer,
  CheckCircle2,
  Tablets,
  FileText,
  Stethoscope,
  Cross,
} from 'lucide-react';
import { useApp } from '../store';
import { QUICK_MEDICINES, HINDI_RX_INTRO } from '../data';
import type { Medicine } from '../types';
import { speakHindi, stopSpeaking } from '../lib';

export default function PrescriptionStudio() {
  const { patients, activePatientId, setActiveTab, addMedicine, removeMedicine, completeConsultation } = useApp();
  const patient = patients.find((p) => p.id === activePatientId);
  const [speaking, setSpeaking] = useState(false);
  const [diagEn, setDiagEn] = useState('');
  const [diagHi, setDiagHi] = useState('');
  const [advice, setAdvice] = useState('Rest, plenty of fluids, follow-up in 3 days');

  if (!patient) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-10 text-center">
        <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="font-display font-bold text-xl text-slate-700">No patient selected</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Go to the triage queue and click "Consult & Prescribe".</p>
        <button
          onClick={() => setActiveTab('triage')}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
        >
          Back to Triage Queue
        </button>
      </div>
    );
  }

  const addQuick = (m: (typeof QUICK_MEDICINES)[number]) => {
    addMedicine(patient.id, {
      name: m.name,
      nameHindi: m.nameHindi,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      notes: m.notes,
    });
  };

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const lines = [
      `रोगी का नाम, ${patient.name}, उम्र ${patient.age} साल।`,
      `निदान, ${diagHi || diagEn || 'लंबित'}.`,
      HINDI_RX_INTRO,
      ...patient.medicines.map((m) => `${m.nameHindi}, ${m.dosage}, ${m.frequency}, ${m.duration}।`),
      `सलाह, ${advice}।`,
    ];
    speakHindi(lines.join(' '));
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), (lines.join(' ').length / 12) * 1000 + 2000);
  };

  const handleComplete = () => {
    completeConsultation(patient.id);
    setActiveTab('analytics');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActiveTab('triage')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:border-teal-400 hover:text-teal-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-lg text-slate-900 truncate">E-Prescription Studio</h2>
          <p className="text-xs text-slate-500">
            Token #{patient.token} · {patient.name} · {patient.abhaId}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${
            patient.severity === 'critical'
              ? 'bg-red-500 text-white'
              : patient.severity === 'priority'
                ? 'bg-amber-400 text-white'
                : 'bg-emerald-400 text-white'
          }`}
        >
          {patient.severity}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT — Composer */}
        <div className="space-y-4">
          {/* Quick add chips */}
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4">
            <h3 className="font-display font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Tablets className="w-4 h-4 text-teal-600" />
              Quick-Add Medicines
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_MEDICINES.map((m, i) => (
                <button
                  key={i}
                  onClick={() => addQuick(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4 space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Clinical Diagnosis
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase mb-1 block">English</label>
                <input
                  value={diagEn}
                  onChange={(e) => setDiagEn(e.target.value)}
                  placeholder="e.g. Acute coronary syndrome"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase mb-1 block">Hindi</label>
                <input
                  value={diagHi}
                  onChange={(e) => setDiagHi(e.target.value)}
                  placeholder="जैसे गंभीर हृदय संबंधी स्थिति"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase mb-1 block">General Advice</label>
              <input
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
          </div>

          {/* Medicine list */}
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                <Tablets className="w-4 h-4 text-teal-600" />
                Prescribed Medicines
                <span className="text-xs font-normal text-slate-400">({patient.medicines.length})</span>
              </h3>
            </div>
            {patient.medicines.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No medicines added yet — use quick-add chips above.</p>
            ) : (
              <div className="space-y-2">
                {patient.medicines.map((m) => (
                  <MedicineRow
                    key={m.id}
                    med={m}
                    onRemove={() => removeMedicine(patient.id, m.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Complete */}
          <button
            onClick={handleComplete}
            disabled={patient.status === 'consulted'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            {patient.status === 'consulted' ? 'Consultation Completed' : 'Complete Consultation'}
          </button>
        </div>

        {/* RIGHT — Live preview */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow-lg overflow-hidden print-area">
            {/* Rx header */}
            <div className="teal-gradient px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cross className="w-6 h-6" />
                  <div>
                    <div className="font-display font-extrabold text-lg leading-tight">VaniCare AI</div>
                    <div className="text-[10px] text-teal-50">e-Prescription · ABDM-compliant</div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-teal-50 leading-tight">
                  <div>{new Date().toLocaleDateString('en-IN')}</div>
                  <div>Token #{patient.token}</div>
                </div>
              </div>
            </div>

            {/* Patient block */}
            <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <InfoLine label="Patient" value={patient.name} />
              <InfoLine label="Age/Sex" value={`${patient.age} / ${patient.gender}`} />
              <InfoLine label="ABHA ID" value={patient.abhaId} mono />
              <InfoLine label="Dialect" value={patient.dialect} />
              <InfoLine label="Village" value={`${patient.village}, ${patient.ward}`} />
              <InfoLine
                label="Vitals"
                value={`SpO₂ ${patient.vitals.spo2}% · ${patient.vitals.tempF}°F · BP ${patient.vitals.bpSys}/${patient.vitals.bpDia}`}
              />
            </div>

            {/* Diagnosis */}
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="text-[10px] font-bold uppercase text-teal-600 tracking-wide mb-1">Diagnosis / निदान</div>
              <div className="text-sm font-semibold text-slate-800">{diagEn || '—'}</div>
              <div className="text-sm text-slate-600 font-hindi">{diagHi || '—'}</div>
            </div>

            {/* Rx symbol + meds */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display font-extrabold text-2xl text-teal-700">℞</span>
                <span className="text-[10px] font-bold uppercase text-teal-600 tracking-wide">Prescription / दवाएं</span>
              </div>
              {patient.medicines.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-2">No medicines prescribed yet.</p>
              ) : (
                <ol className="space-y-2">
                  {patient.medicines.map((m, i) => (
                    <li key={m.id} className="flex gap-2.5 text-sm">
                      <span className="font-bold text-teal-600 tabular-nums">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{m.name}</div>
                        <div className="text-slate-600 text-xs">{m.nameHindi}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span className="font-medium">{m.dosage}</span> · {m.frequency} · {m.duration}
                          {m.notes && <span className="text-slate-400"> · {m.notes}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Advice */}
            <div className="px-5 py-3 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase text-teal-600 tracking-wide mb-1">Advice / सलाह</div>
              <div className="text-sm text-slate-700">{advice}</div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 leading-tight">
                VaniCare AI CDSS · Final diagnosis must be verified by a licensed physician.
                <div className="text-slate-300">Digitally generated · {new Date().toLocaleString('en-IN')}</div>
              </div>
              <div className="text-right">
                <div className="w-24 border-b border-slate-300 mb-0.5" />
                <div className="text-[10px] text-slate-500">Doctor's Signature</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSpeak}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${
                speaking
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {speaking ? 'Stop Reading' : '🔊 Read Aloud in Hindi'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicineRow({ med, onRemove }: { med: Medicine; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 animate-fadeIn">
      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
        <Tablets className="w-4 h-4 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-800">{med.name}</div>
        <div className="text-xs text-slate-500">{med.nameHindi}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500">
          <span><span className="font-semibold text-slate-600">Dose:</span> {med.dosage}</span>
          <span><span className="font-semibold text-slate-600">Freq:</span> {med.frequency}</span>
          <span><span className="font-semibold text-slate-600">Duration:</span> {med.duration}</span>
          {med.notes && <span className="text-slate-400">· {med.notes}</span>}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function InfoLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-slate-400 font-medium">{label}:</span>
      <span className={`text-slate-700 font-semibold ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}
