import { ReactNode, Suspense, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { MobileNavigation } from "./MobileNavigation";
import { MobileBottomNav } from "./MobileBottomNav";
import { CommandPalette } from "./CommandPalette";
import { PageSkeleton } from "./PageSkeleton";
import { NetworkRecoveryBanner } from "./NetworkRecoveryBanner";
import { DemoBanner } from "@/demo/DemoBanner";
import { DemoControlPanel } from "@/demo/DemoControlPanel";
import { DemoErrorBoundary } from "@/demo/DemoErrorBoundary";
import { WalletRecoveryNotice } from "./WalletRecoveryNotice";
import { HardenedErrorBoundary } from "../HardenedErrorBoundary";
import { DappWalletProvider } from "@/hooks/useDappWallet";
import { cn } from "@/lib/utils";
import {
  NavigationPreferencesProvider,
  useNavigationPreferences,
} from "@/navigation/useNavigationPreferences";
import { useDocumentTitle } from "@/navigation/useDocumentTitle";
import { useGlobalShortcuts } from "@/navigation/useGlobalShortcuts";
import { trackRoute } from "@/hardening/routeTracker";

function HardenedDAppShellInner({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { preferences, toggleSidebar } = useNavigationPreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useDocumentTitle();
  useGlobalShortcuts(
    () => {
      if (preferences.commandPaletteEnabled) {
        setCommandOpen(true);
      }
    },
    preferences.commandPaletteEnabled,
  );

  useEffect(() => {
    trackRoute(location);
    setMobileOpen(false);

    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });

    if (!window.location.hash) {
      window.scrollTo({
        top: 0,
        behavior: preferences.animationsEnabled ? "smooth" : "auto",
      });
    }
  }, [location, preferences.animationsEnabled]);

  return (
    <div
      className={cn(
        "proofloan-app min-h-screen bg-[#070b12] text-slate-100",
        preferences.compactMode && "proofloan-compact",
        !preferences.animationsEnabled && "proofloan-reduce-motion",
      )}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <AppSidebar
        collapsed={preferences.sidebarCollapsed}
        onToggle={toggleSidebar}
        onOpenCommandPalette={() => {
          if (preferences.commandPaletteEnabled) {
            setCommandOpen(true);
          }
        }}
      />
      <div
        className={
          preferences.sidebarCollapsed
            ? "min-h-screen lg:pl-[76px]"
            : "min-h-screen lg:pl-[270px]"
        }
      >
        <AppTopbar
          sidebarCollapsed={preferences.sidebarCollapsed}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenCommandPalette={() => {
            if (preferences.commandPaletteEnabled) {
              setCommandOpen(true);
            }
          }}
        />
        <NetworkRecoveryBanner />
        <DemoBanner />
        <main id="main-content" tabIndex={-1} className="pb-20 outline-none lg:pb-0">
          <HardenedErrorBoundary>
            <div
              key={location}
              className={preferences.animationsEnabled ? "animate-page-enter" : ""}
            >
              <div className="mx-auto max-w-[1500px] px-4 pt-4 empty:hidden empty:p-0 sm:px-6 lg:px-8">
                <WalletRecoveryNotice />
              </div>
              <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
            </div>
          </HardenedErrorBoundary>
        </main>
      </div>
      <MobileNavigation open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <MobileBottomNav onOpenMore={() => setMobileOpen(true)} />
      {preferences.commandPaletteEnabled && (
        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      )}
      <DemoErrorBoundary>
        <DemoControlPanel />
      </DemoErrorBoundary>
    </div>
  );
}

export function HardenedDAppShell({ children }: { children: ReactNode }) {
  return (
    <NavigationPreferencesProvider>
      <DappWalletProvider>
        <HardenedDAppShellInner>{children}</HardenedDAppShellInner>
      </DappWalletProvider>
    </NavigationPreferencesProvider>
  );
}
