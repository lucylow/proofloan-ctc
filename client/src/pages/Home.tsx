import { IntakeDocs, IntakeHero, IntakeHowItWorks } from "./intake/IntakeMarketing";
import { IntakeFooter, IntakeHeader, IntakeOfflineNotice } from "./intake/IntakeChrome";
import { BorrowerWorkspace } from "./intake/BorrowerWorkspace";
import { ReplayProtectionPanel } from "./intake/ReplayProtectionPanel";
import { useIntakeWorkspace } from "./intake/useIntakeWorkspace";

export default function Home() {
  const intake = useIntakeWorkspace();

  return (
    <div className="proofloan-app min-h-screen overflow-x-clip text-slate-100 selection:bg-cyan-300 selection:text-slate-950">
      <IntakeHeader
        activeSection={intake.activeSection}
        onSelectSection={intake.setActiveSection}
        onStart={intake.scrollToApply}
      />
      <main id="top" className="mx-auto max-w-7xl overflow-x-clip px-4 sm:px-6">
        {!intake.isOnline && <IntakeOfflineNotice />}
        <ReplayProtectionPanel />
        <IntakeHero onStart={intake.scrollToApply} />
        <IntakeHowItWorks />
        <BorrowerWorkspace {...intake} />
        <IntakeDocs />
      </main>
      <IntakeFooter />
    </div>
  );
}
