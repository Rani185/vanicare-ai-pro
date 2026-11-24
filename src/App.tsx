import { AppProvider, useApp } from './store';
import TopCommandBar from './components/TopCommandBar';
import TabNav from './components/TabNav';
import VoiceTriageKiosk from './components/VoiceTriageKiosk';
import DoctorQueue from './components/DoctorQueue';
import PrescriptionStudio from './components/PrescriptionStudio';
import AnalyticsTab from './components/AnalyticsTab';

function Shell() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopCommandBar />
      <TabNav />

      <main className="flex-1">
        {activeTab === 'triage' && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
            <div className="grid lg:grid-cols-2 gap-5">
              {/* ASHA sees the kiosk; doctor sees queue primarily but both panels accessible */}
              <div className="space-y-4">
                <VoiceTriageKiosk />
              </div>
              <div className="lg:h-[calc(100vh-180px)]">
                <DoctorQueue />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'prescription' && <PrescriptionStudio />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 text-center">
        <p className="text-[11px] text-slate-400">
          VaniCare AI · Vernacular Voice-First Clinical Triage &amp; Rural PHC Operating System ·
          Built for ABDM &amp; eSanjeevani integration
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
