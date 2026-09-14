import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { readJson, removeSafe, resolveStorage, writeJson } from "@/hardening/safeStorage";

const STORAGE_KEY = "proofloan.navigation.preferences";

type Preferences = {
  sidebarCollapsed: boolean;
  compactMode: boolean;
  commandPaletteEnabled: boolean;
  animationsEnabled: boolean;
};

const defaults: Preferences = {
  sidebarCollapsed: false,
  compactMode: false,
  commandPaletteEnabled: true,
  animationsEnabled: true,
};

type NavigationPreferencesValue = {
  preferences: Preferences;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  setCompactMode: (value: boolean) => void;
  setCommandPaletteEnabled: (value: boolean) => void;
  setAnimationsEnabled: (value: boolean) => void;
};

const NavigationPreferencesContext =
  createContext<NavigationPreferencesValue | null>(null);

function readPreferences(): Preferences {
  const result = readJson<Partial<Preferences>>(
    resolveStorage("local"),
    STORAGE_KEY,
    defaults,
  );

  if (!result.ok || !result.value || typeof result.value !== "object") {
    return defaults;
  }

  return {
    ...defaults,
    ...result.value,
  };
}

export function resetNavigationPreferences() {
  removeSafe(resolveStorage("local"), STORAGE_KEY);
}

function useNavigationPreferencesState(): NavigationPreferencesValue {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);

  useEffect(() => {
    writeJson(resolveStorage("local"), STORAGE_KEY, preferences);
  }, [preferences]);

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setPreferences(current => ({
      ...current,
      sidebarCollapsed: value,
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setPreferences(current => ({
      ...current,
      sidebarCollapsed: !current.sidebarCollapsed,
    }));
  }, []);

  const setCompactMode = useCallback((value: boolean) => {
    setPreferences(current => ({
      ...current,
      compactMode: value,
    }));
  }, []);

  const setCommandPaletteEnabled = useCallback((value: boolean) => {
    setPreferences(current => ({
      ...current,
      commandPaletteEnabled: value,
    }));
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setPreferences(current => ({
      ...current,
      animationsEnabled: value,
    }));
  }, []);

  return {
    preferences,
    setSidebarCollapsed,
    toggleSidebar,
    setCompactMode,
    setCommandPaletteEnabled,
    setAnimationsEnabled,
  };
}

export function NavigationPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useNavigationPreferencesState();
  return createElement(NavigationPreferencesContext.Provider, { value }, children);
}

export function useNavigationPreferences() {
  const value = useContext(NavigationPreferencesContext);
  if (!value) {
    throw new Error(
      "useNavigationPreferences must be used within NavigationPreferencesProvider",
    );
  }
  return value;
}
