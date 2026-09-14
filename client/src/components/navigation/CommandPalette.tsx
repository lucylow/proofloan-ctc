import {
  ArrowRight,
  Command,
  Search,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import {
  desktopNavigationGroups,
  findNavigationItem,
  navigationItems,
} from "@/navigation/config";
import { useDemoSearch } from "@/demo/useDemoSearch";
import { navigateSafely } from "@/hardening/safeNavigation";

import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
};

type PaletteEntry =
  | { kind: "page"; id: string; path: string; label: string; description: string; icon: (typeof navigationItems)[number]["icon"] }
  | { kind: "application"; id: string; path: string; label: string; description: string };

export function CommandPalette({
  open,
  onClose,
}: Props) {
  const [location, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const demoSearch = useDemoSearch(query);
  const currentItem = findNavigationItem(location);

  const filteredItems = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) {
      return navigationItems;
    }

    return navigationItems.filter(item => {
      const haystack = [
        item.label,
        item.description,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  const groupedPages = useMemo(
    () =>
      desktopNavigationGroups
        .map(group => ({
          ...group,
          items: group.items.filter(item =>
            filteredItems.some(filtered => filtered.id === item.id),
          ),
        }))
        .filter(group => group.items.length > 0),
    [filteredItems],
  );

  const entries = useMemo<PaletteEntry[]>(() => {
    const pages: PaletteEntry[] = filteredItems.map(item => ({
      kind: "page",
      id: item.id,
      path: item.path,
      label: item.label,
      description: item.description,
      icon: item.icon,
    }));

    const applications: PaletteEntry[] =
      query.trim().length > 0
        ? demoSearch.applications.slice(0, 5).map(application => ({
            kind: "application",
            id: application.id,
            path: `/applications/${application.id}`,
            label: application.id,
            description: application.state.replace(/([a-z])([A-Z])/g, "$1 $2"),
          }))
        : [];

    return [...pages, ...applications];
  }, [demoSearch.applications, filteredItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex(current =>
          entries.length === 0 ? 0 : (current + 1) % entries.length,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(current =>
          entries.length === 0
            ? 0
            : (current - 1 + entries.length) % entries.length,
        );
        return;
      }

      if (event.key === "Enter") {
        const selected = entries[selectedIndex] ?? entries[0];
        if (selected) {
          navigateSafely(navigate, selected.path);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [entries, navigate, onClose, open, selectedIndex]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const go = (path: string) => {
    navigateSafely(navigate, path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] grid place-items-start justify-center bg-black/65 px-4 pt-[12vh] backdrop-blur-sm">
      <button
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close search"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search ProofLoan"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b121d] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] p-4">
          <Search className="h-5 w-5 text-slate-500" />

          <Input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search pages and applications..."
            className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
          />

          <kbd className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-500 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {entries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04]">
                <Search className="h-5 w-5 text-slate-600" />
              </div>

              <div className="mt-4 text-sm font-medium text-slate-300">
                No matching pages or applications
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Try “borrow”, “offer”, or an application ID.
              </div>
            </div>
          ) : (
            groupedPages.map(group => (
              <div key={group.section} className="mb-2">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {group.label}
                </div>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const entryIndex = entries.findIndex(
                    entry => entry.kind === "page" && entry.id === item.id,
                  );
                  const selected = entryIndex === selectedIndex;
                  const current = currentItem?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      className={[
                        "group flex w-full items-center gap-3 rounded-2xl p-3 text-left",
                    selected ? "bg-cyan-300/10 ring-1 ring-cyan-300/20" : "hover:bg-white/[0.045]",
                      ].join(" ")}
                      onMouseEnter={() => setSelectedIndex(entryIndex)}
                      onClick={() => go(item.path)}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
                        <Icon className="h-4 w-4 text-cyan-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                          {item.label}
                          {current && (
                            <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                              Current
                            </span>
                          )}
                        </div>

                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {item.description}
                    </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-700 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
                    </button>
                  );
                })}
              </div>
            ))
          )}

          {entries.some(entry => entry.kind === "application") && (
            <div className="border-t border-white/[0.06] p-2">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Applications
              </div>
              {entries
                .filter(entry => entry.kind === "application")
                .map(entry => {
                  const entryIndex = entries.findIndex(
                    item => item.kind === "application" && item.id === entry.id,
                  );
                  const selected = entryIndex === selectedIndex;

                  return (
                    <button
                      key={entry.id}
                      onMouseEnter={() => setSelectedIndex(entryIndex)}
                      onClick={() => go(entry.path)}
                      className={[
                        "flex w-full items-center justify-between rounded-xl p-3 text-left",
                        selected ? "bg-cyan-300/10 ring-1 ring-cyan-300/20" : "hover:bg-white/[0.04]",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[11px] text-slate-300">
                        {entry.label}
                      </span>
                      <span className="text-[10px] text-cyan-300">
                        {entry.description}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-white/[0.07] px-4 py-3 text-[10px] text-slate-500">
          <Command className="h-3 w-3" />
          <span>
            ↑↓ to move · Enter to open · g then a/b/d for shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}
