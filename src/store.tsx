import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import type { Patient, Medicine, TabId, Role, Severity } from './types';
import { PHCS } from './data';

interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'warning' | 'error';
}

interface AppState {
  patients: Patient[];
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  phc: string;
  setPhc: (p: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  online: boolean;
  setOnline: (o: boolean) => void;
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
  addPatient: (p: Omit<Patient, 'id' | 'token' | 'arrivedAt' | 'status' | 'medicines' | 'offline'>) => Patient;
  updatePatient: (id: string, patch: Partial<Patient>) => void;
  addMedicine: (patientId: string, med: Omit<Medicine, 'id'>) => void;
  removeMedicine: (patientId: string, medId: string) => void;
  completeConsultation: (id: string) => void;
  referPatient: (id: string) => void;
  nextToken: number;
}

const Ctx = createContext<AppState | null>(null);

let uidCounter = 0;
const uid = (prefix = 'p') => `${prefix}-${Date.now()}-${uidCounter++}`;

function computeRisk(spo2: number, tempF: number, bpSys: number, bpDia: number, pulse: number): { score: number; severity: Severity } {
  let score = 20;
  if (spo2 < 88) score += 35;
  else if (spo2 < 92) score += 26;
  else if (spo2 < 94) score += 16;
  if (tempF > 103) score += 24;
  else if (tempF > 102) score += 18;
  else if (tempF > 100.4) score += 8;
  if (bpSys > 160 || bpDia > 100) score += 22;
  else if (bpSys > 140 || bpDia > 90) score += 12;
  if (pulse > 110) score += 12;
  else if (pulse > 100) score += 6;
  score = Math.min(100, Math.max(5, score));
  let severity: Severity = 'routine';
  if (score >= 70) severity = 'critical';
  else if (score >= 40) severity = 'priority';
  return { score, severity };
}

export function computeRiskExport(v: { spo2: number; tempF: number; bpSys: number; bpDia: number; pulse: number }) {
  return computeRisk(v.spo2, v.tempF, v.bpSys, v.bpDia, v.pulse);
}

const SEED: Patient[] = [
  {
    id: uid(),
    token: 1,
    name: 'Ramprasad Yadav',
    age: 62,
    gender: 'M',
    abhaId: 'ABHA-91-2387-4456-2104',
    dialect: 'Bhojpuri',
    vernacularQuote:
      'Bihaan se chhati ke baayein taraf tej dard ba aur saans phoolat ba, pasina aawat ba.',
    englishSummary:
      'Chest pain on left side since morning with breathlessness and diaphoresis. Suspected acute coronary syndrome.',
    vitals: { spo2: 91, tempF: 98.6, bpSys: 165, bpDia: 100, pulse: 112 },
    riskScore: 94,
    severity: 'critical',
    status: 'waiting',
    village: 'Belahi',
    ward: 'Ward-02',
    arrivedAt: Date.now() - 1000 * 60 * 8,
    medicines: [],
    offline: false,
  },
  {
    id: uid(),
    token: 2,
    name: 'Sunita Jha',
    age: 34,
    gender: 'F',
    abhaId: 'ABHA-91-5512-8890-3327',
    dialect: 'Maithili',
    vernacularQuote:
      'Teen din se tej bukhar aa aankh ke peechhe dard aich, deh hath tutait aich.',
    englishSummary:
      'High fever for 3 days with retro-orbital pain and body ache. Suspected dengue fever.',
    vitals: { spo2: 97, tempF: 103.4, bpSys: 110, bpDia: 70, pulse: 98 },
    riskScore: 68,
    severity: 'priority',
    status: 'waiting',
    village: 'Rampur',
    ward: 'Ward-03',
    arrivedAt: Date.now() - 1000 * 60 * 5,
    medicines: [],
    offline: false,
  },
  {
    id: uid(),
    token: 3,
    name: 'Pooja Kumari',
    age: 25,
    gender: 'F',
    abhaId: 'ABHA-91-7740-1126-8805',
    dialect: 'Magahi',
    vernacularQuote:
      'Saat mahina ke garbh ba aur pait mein tej dard aur chakkar aa rahal ba.',
    englishSummary:
      '7 months pregnant with severe abdominal pain and dizziness. Hypertensive disorder of pregnancy — refer urgently.',
    vitals: { spo2: 95, tempF: 99.1, bpSys: 148, bpDia: 95, pulse: 88 },
    riskScore: 62,
    severity: 'priority',
    status: 'waiting',
    village: 'Kako',
    ward: 'Ward-05',
    arrivedAt: Date.now() - 1000 * 60 * 3,
    medicines: [],
    offline: false,
  },
  {
    id: uid(),
    token: 4,
    name: 'Mohan Lal',
    age: 26,
    gender: 'M',
    abhaId: 'ABHA-91-3390-6671-4498',
    dialect: 'Hindi',
    vernacularQuote: 'Do din se halka zukam aur sukhi khansi hai.',
    englishSummary:
      'Mild cold and dry cough for 2 days. Routine upper respiratory infection.',
    vitals: { spo2: 99, tempF: 99.4, bpSys: 120, bpDia: 80, pulse: 76 },
    riskScore: 22,
    severity: 'routine',
    status: 'waiting',
    village: 'Manpur',
    ward: 'Ward-01',
    arrivedAt: Date.now() - 1000 * 60 * 2,
    medicines: [],
    offline: false,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(SEED);
  const [activeTab, setActiveTab] = useState<TabId>('triage');
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [phc, setPhc] = useState<string>(PHCS[0]);
  const [role, setRole] = useState<Role>('asha');
  const [online, setOnline] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextTokenRef = useRef(5);
  const pendingOfflineRef = useRef<Patient[]>([]);

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = uid('t');
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Online/offline sync logic
  const handleSetOnline = useCallback(
    (o: boolean) => {
      setOnline(o);
      if (!o) {
        pushToast('Offline mode active — patients queued locally', 'warning');
      } else {
        const pending = pendingOfflineRef.current;
        if (pending.length > 0) {
          setPatients((prev) => {
            const withSynced = pending.map((p) => ({ ...p, offline: false }));
            return [...prev, ...withSynced];
          });
          pendingOfflineRef.current = [];
          pushToast(
            `Synced ${pending.length} pending patient${pending.length > 1 ? 's' : ''} from offline queue`,
            'success',
          );
        } else {
          pushToast('Back online — no pending records to sync', 'success');
        }
      }
    },
    [pushToast],
  );

  const addPatient: AppState['addPatient'] = useCallback(
    (p) => {
      const newPatient: Patient = {
        ...p,
        id: uid(),
        token: nextTokenRef.current++,
        arrivedAt: Date.now(),
        status: 'waiting',
        medicines: [],
        offline: !online,
      };
      if (!online) {
        pendingOfflineRef.current = [...pendingOfflineRef.current, newPatient];
        pushToast(
          `Patient queued offline — will sync when online (${pendingOfflineRef.current.length} pending)`,
          'warning',
        );
      } else {
        setPatients((prev) => [...prev, newPatient]);
        pushToast(`Token #${newPatient.token} — ${newPatient.name} dispatched to doctor queue`, 'success');
      }
      return newPatient;
    },
    [online, pushToast],
  );

  const updatePatient = useCallback((id: string, patch: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const addMedicine = useCallback((patientId: string, med: Omit<Medicine, 'id'>) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, medicines: [...p.medicines, { ...med, id: uid('m') }] } : p,
      ),
    );
  }, []);

  const removeMedicine = useCallback((patientId: string, medId: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, medicines: p.medicines.filter((m) => m.id !== medId) }
          : p,
      ),
    );
  }, []);

  const completeConsultation = useCallback(
    (id: string) => {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'consulted', consultedAt: Date.now() } : p,
        ),
      );
      const pat = patients.find((p) => p.id === id);
      if (pat) pushToast(`Consultation completed — ${pat.name} ✔`, 'success');
    },
    [patients, pushToast],
  );

  const referPatient = useCallback(
    (id: string) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'referred' } : p)),
      );
      const pat = patients.find((p) => p.id === id);
      if (pat) pushToast(`108 Ambulance dispatched for ${pat.name}`, 'error');
    },
    [patients, pushToast],
  );

  // keep nextToken in sync if seed changes
  useEffect(() => {
    const maxToken = Math.max(...patients.map((p) => p.token), 0);
    if (maxToken >= nextTokenRef.current) nextTokenRef.current = maxToken + 1;
  }, [patients]);

  const value: AppState = {
    patients,
    activeTab,
    setActiveTab,
    activePatientId,
    setActivePatientId,
    phc,
    setPhc,
    role,
    setRole,
    online: online,
    setOnline: handleSetOnline,
    toasts,
    pushToast,
    dismissToast,
    addPatient,
    updatePatient,
    addMedicine,
    removeMedicine,
    completeConsultation,
    referPatient,
    nextToken: nextTokenRef.current,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
