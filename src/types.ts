export type Severity = 'critical' | 'priority' | 'routine';

export type Dialect = 'Bhojpuri' | 'Maithili' | 'Magahi' | 'Hindi' | 'Indian English';

export type ConsultationStatus = 'waiting' | 'consulting' | 'consulted' | 'referred';

export interface Vitals {
  spo2: number;
  tempF: number;
  bpSys: number;
  bpDia: number;
  pulse: number;
}

export interface Medicine {
  id: string;
  name: string;
  nameHindi: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1" morning-afternoon-night
  duration: string;
  notes?: string;
}

export interface Patient {
  id: string;
  token: number;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  abhaId: string;
  dialect: Dialect;
  vernacularQuote: string;
  englishSummary: string;
  vitals: Vitals;
  riskScore: number;
  severity: Severity;
  status: ConsultationStatus;
  village: string;
  ward: string;
  arrivedAt: number;
  consultedAt?: number;
  medicines: Medicine[];
  offline: boolean;
}

export interface ScenarioPreset {
  label: string;
  dialect: Dialect;
  name: string;
  age: number;
  gender: 'M' | 'F';
  abhaId: string;
  vitals: Vitals;
  village: string;
  ward: string;
  vernacularQuote: string;
  englishSummary: string;
}

export type Role = 'asha' | 'doctor';
export type TabId = 'triage' | 'prescription' | 'analytics';
