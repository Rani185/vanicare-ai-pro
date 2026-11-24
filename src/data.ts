import type { ScenarioPreset } from './types';

export const PHCS = [
  'PHC Darbhanga Block-04',
  'PHC Purnia Sadar',
  'PHC Gaya Rural',
] as const;

export const DIALECTS = [
  'Bhojpuri',
  'Maithili',
  'Magahi',
  'Hindi',
  'Indian English',
] as const;

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    label: 'Bhojpuri — Critical Cardiac',
    dialect: 'Bhojpuri',
    name: 'Ramprasad Yadav',
    age: 62,
    gender: 'M',
    abhaId: 'ABHA-91-2387-4456-2104',
    vitals: { spo2: 91, tempF: 98.6, bpSys: 165, bpDia: 100, pulse: 112 },
    village: 'Belahi',
    ward: 'Ward-02',
    vernacularQuote:
      'Bihaan se chhati ke baayein taraf tej dard ba aur saans phoolat ba, pasina aawat ba.',
    englishSummary:
      'Chest pain on left side since morning with breathlessness and diaphoresis. Suspected acute coronary syndrome.',
  },
  {
    label: 'Maithili — Dengue / High Fever',
    dialect: 'Maithili',
    name: 'Sunita Jha',
    age: 34,
    gender: 'F',
    abhaId: 'ABHA-91-5512-8890-3327',
    vitals: { spo2: 97, tempF: 103.4, bpSys: 110, bpDia: 70, pulse: 98 },
    village: 'Rampur',
    ward: 'Ward-03',
    vernacularQuote:
      'Teen din se tej bukhar aa aankh ke peechhe dard aich, deh hath tutait aich.',
    englishSummary:
      'High fever for 3 days with retro-orbital pain and body ache. Suspected dengue fever.',
  },
  {
    label: 'Magahi — High-Risk Maternal',
    dialect: 'Magahi',
    name: 'Pooja Kumari',
    age: 25,
    gender: 'F',
    abhaId: 'ABHA-91-7740-1126-8805',
    vitals: { spo2: 95, tempF: 99.1, bpSys: 148, bpDia: 95, pulse: 88 },
    village: 'Kako',
    ward: 'Ward-05',
    vernacularQuote:
      'Saat mahina ke garbh ba aur pait mein tej dard aur chakkar aa rahal ba.',
    englishSummary:
      '7 months pregnant with severe abdominal pain and dizziness. Hypertensive disorder of pregnancy — refer urgently.',
  },
  {
    label: 'Hindi — Routine Viral',
    dialect: 'Hindi',
    name: 'Mohan Lal',
    age: 26,
    gender: 'M',
    abhaId: 'ABHA-91-3390-6671-4498',
    vitals: { spo2: 99, tempF: 99.4, bpSys: 120, bpDia: 80, pulse: 76 },
    village: 'Manpur',
    ward: 'Ward-01',
    vernacularQuote: 'Do din se halka zukam aur sukhi khansi hai.',
    englishSummary:
      'Mild cold and dry cough for 2 days. Routine upper respiratory infection.',
  },
];

export const QUICK_MEDICINES: {
  name: string;
  nameHindi: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}[] = [
  {
    name: 'Paracetamol 650mg',
    nameHindi: 'पैरासिटामॉल 650 मि.ग्रा.',
    dosage: '650 mg',
    frequency: '1-0-1',
    duration: '5 days',
    notes: 'After meals',
  },
  {
    name: 'ORS + Zinc',
    nameHindi: 'ओ.आर.एस. + जिंक',
    dosage: '1 sachet + 20mg',
    frequency: '1-1-1',
    duration: '7 days',
    notes: 'Dissolve ORS in 1L water',
  },
  {
    name: 'Azithromycin 500mg',
    nameHindi: 'एज़िथ्रोमाइसिन 500 मि.ग्रा.',
    dosage: '500 mg',
    frequency: '1-0-0',
    duration: '3 days',
    notes: 'Empty stomach',
  },
  {
    name: 'ECG + Troponin-T Stat',
    nameHindi: 'ई.सी.जी. + ट्रोपोनिन-टी तुरंत',
    dosage: 'Stat',
    frequency: 'STAT',
    duration: 'Once',
    notes: 'Immediate cardiac workup',
  },
  {
    name: 'Refer to District ICU',
    nameHindi: 'ज़िला आई.सी.यू. रेफर',
    dosage: 'Urgent',
    frequency: 'ASAP',
    duration: '—',
    notes: '108 Ambulance dispatched',
  },
];

export const HINDI_RX_INTRO =
  'यह ई-पर्चा वाणीकेयर ए आई द्वारा तैयार की गई है। दवाएं निर्देशानुसार लें।';
