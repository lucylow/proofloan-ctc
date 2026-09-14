import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hardening/onlineStatus";
import {
  buildPersistenceDiagnosticsExport,
  clearPersistenceFailureAlertAcknowledgment,
  clearPersistenceFailureAlertUnacknowledgment,
  DEFAULT_PERSISTENCE_FAILURE_ALERT_THRESHOLDS,
  filterPersistenceFailureHistory,
  getPersistenceAlertThresholdRestorationNotice,
  getPersistenceFailureAlertEscalationNotice,
  getPersistenceFailureAlertExplanation,
  getPersistenceFailureAlertLabel,
  getPersistenceFailureAlertLevel,
  getPersistenceFailureAlertAcknowledgmentKey,
  getPersistenceFailureAlertAcknowledgmentNotice,
  getPersistenceFailureAlertUnacknowledgmentNotice,
  getPersistenceFailureFreshness,
  getPersistenceFailureTrend,
  getPersistenceHistoryFilterSummary,
  getPersistenceFilterRestorationNotice,
  getPersistenceRuleGuidance,
  getPersistenceRuleRecurrence,
  isPersistenceFailureAlertAcknowledged,
  normalizePersistenceFailureAlertThresholds,
  PERSISTENCE_RULE_GUIDANCE,
  isPersistenceFailureAlertUnacknowledged,
  readPersistenceFailureAlertAcknowledgment,
  readPersistenceFailureAlertThresholds,
  readPersistenceFailureAlertUnacknowledgment,
  readPersistenceFailureHistoryFilter,
  writePersistenceFailureAlertAcknowledgment,
  writePersistenceFailureAlertThresholds,
  writePersistenceFailureAlertUnacknowledgment,
  writePersistenceFailureHistoryFilter,
  type PersistenceFailureAlertAcknowledgment,
  type PersistenceFailureAlertLevel,
  type PersistenceFailureAlertUnacknowledgment,
  type PersistenceFailureAlertThresholds,
  type PersistenceFailureHistoryFilter,
} from "@/lib/persistenceDiagnostics";
import {
  appendReplayRefreshTimelineEvent,
  appendReplayRefreshThresholdAuditEvent,
  areReplayRefreshSeverityThresholdsEqual,
  categorizeReplayRefreshFailure,
  formatReplayDiagnosticsTimestamp,
  getReplayDiagnosticsFreshness,
  getReplayDiagnosticsRefreshFeedback,
  getReplayDiagnosticsRefreshState,
  filterReplayRefreshTimeline,
  getReplayDiagnosticsRows,
  getReplayRefreshCategoryCounts,
  getReplayRefreshCategoryTrends,
  getReplayRefreshFailureLabel,
  getReplayRefreshSeverityExplanation,
  getReplayRefreshSeverityNotice,
  persistReplayRefreshSeverityThresholds,
  shouldApplyReplayRefreshPersistenceUpdate,
  getReplayRefreshSeverityStatusSummary,
  getReplayRefreshThresholdAuditAriaLabel,
  getReplayRefreshThresholdAuditLabel,
  getReplayRefreshFilterChangeNotice,
  getReplayRefreshFilterChangeScopeNotice,
  getReplayRefreshFilterScopeLabel,
  getReplayRefreshFilterRestorationNotice,
  getReplayRefreshTimelineSummary,
  readReplayRefreshSeverityThresholds,
  readReplayRefreshTimelineFilter,
  shouldShowReplayRefreshFilterReset,
  writeReplayRefreshTimelineFilter,
  getReplayRefreshTrend,
  normalizeReplayDiagnostics,
  normalizeReplayRefreshSeverityThresholds,
  shouldApplyReplayRefreshOutcome,
  type ReplayDiagnosticsRefreshOutcome,
  type ReplayRefreshTimelineEvent,
  type ReplayRefreshThresholdAuditEvent,
  type ReplayRefreshTimelineFilter,
} from "@/lib/replayDiagnosticsView";

function sessionStorageOrUndefined() {
  return typeof window === "undefined" ? undefined : window.sessionStorage;
}

export function ReplayProtectionPanel() {
  const isOnline = useOnlineStatus();
  const [replayRefreshOutcome, setReplayRefreshOutcome] = useState<ReplayDiagnosticsRefreshOutcome>("idle");
  const [replayTimelineFilter, setReplayTimelineFilter] = useState<ReplayRefreshTimelineFilter>(() => readReplayRefreshTimelineFilter(sessionStorageOrUndefined()));
  const [replayTimelineFilterRestored, setReplayTimelineFilterRestored] = useState(() => typeof window !== "undefined" && readReplayRefreshTimelineFilter(window.sessionStorage) !== "all");
  const [replayTimelineFilterChangeNotice, setReplayTimelineFilterChangeNotice] = useState<string | null>(null);
  const [replayRefreshSeverityThresholds, setReplayRefreshSeverityThresholds] = useState(() => readReplayRefreshSeverityThresholds(sessionStorageOrUndefined()));
  const [replayRefreshSeverityNotice, setReplayRefreshSeverityNotice] = useState<string | null>(null);
  const [replayRefreshSeverityPersistenceWarning, setReplayRefreshSeverityPersistenceWarning] = useState<string | null>(null);
  const [replayRefreshSeverityPersistenceStatus, setReplayRefreshSeverityPersistenceStatus] = useState("");
  const [replayRefreshSeverityPersistenceAvailable, setReplayRefreshSeverityPersistenceAvailable] = useState<boolean | null>(null);
  const [persistenceHistoryFilter, setPersistenceHistoryFilter] = useState<PersistenceFailureHistoryFilter>(() => readPersistenceFailureHistoryFilter(sessionStorageOrUndefined()));
  const [persistenceFilterRestored, setPersistenceFilterRestored] = useState(() => readPersistenceFailureHistoryFilter(sessionStorageOrUndefined()) !== "all");
  const [persistenceAlertThresholds, setPersistenceAlertThresholds] = useState<PersistenceFailureAlertThresholds>(() => readPersistenceFailureAlertThresholds(sessionStorageOrUndefined()));
  const [persistenceThresholdsRestored, setPersistenceThresholdsRestored] = useState(() => {
    const restored = readPersistenceFailureAlertThresholds(sessionStorageOrUndefined());
    return restored.watchCount !== DEFAULT_PERSISTENCE_FAILURE_ALERT_THRESHOLDS.watchCount || restored.criticalCount !== DEFAULT_PERSISTENCE_FAILURE_ALERT_THRESHOLDS.criticalCount;
  });
  const [persistenceAlertAcknowledgment, setPersistenceAlertAcknowledgment] = useState<PersistenceFailureAlertAcknowledgment | null>(() => typeof window === "undefined" ? null : readPersistenceFailureAlertAcknowledgment(window.sessionStorage));
  const [persistenceAlertUnacknowledgment, setPersistenceAlertUnacknowledgment] = useState<PersistenceFailureAlertUnacknowledgment | null>(() => typeof window === "undefined" ? null : readPersistenceFailureAlertUnacknowledgment(window.sessionStorage));
  const [persistenceExportFeedback, setPersistenceExportFeedback] = useState<string | null>(null);
  const previousPersistenceAlertRef = useRef<PersistenceFailureAlertLevel>("clear");
  const [replayRefreshTimeline, setReplayRefreshTimeline] = useState<ReplayRefreshTimelineEvent[]>([]);
  const [replayRefreshThresholdAudit, setReplayRefreshThresholdAudit] = useState<ReplayRefreshThresholdAuditEvent[]>([]);
  const replayRefreshRequestRef = useRef(0);
  const replayRefreshMountedRef = useRef(true);

  useEffect(() => {
    const storage = sessionStorageOrUndefined();
    writePersistenceFailureHistoryFilter(storage, persistenceHistoryFilter);
    writePersistenceFailureAlertThresholds(storage, persistenceAlertThresholds);
    if (persistenceAlertAcknowledgment) writePersistenceFailureAlertAcknowledgment(storage, persistenceAlertAcknowledgment);
    else clearPersistenceFailureAlertAcknowledgment(storage);
    if (persistenceAlertUnacknowledgment) writePersistenceFailureAlertUnacknowledgment(storage, persistenceAlertUnacknowledgment);
    else clearPersistenceFailureAlertUnacknowledgment(storage);
  }, [persistenceHistoryFilter, persistenceAlertThresholds, persistenceAlertAcknowledgment, persistenceAlertUnacknowledgment]);

  useEffect(() => () => {
    replayRefreshMountedRef.current = false;
    replayRefreshRequestRef.current += 1;
  }, []);

  const authQuery = trpc.auth.me.useQuery();
  const replayDiagnostics = trpc.proofloan.replayDiagnostics.useQuery(undefined, { enabled: authQuery.data?.role === "admin", refetchInterval: 30_000 });
  const isAdmin = authQuery.data?.role === "admin";
  const safeReplayDiagnostics = normalizeReplayDiagnostics(replayDiagnostics.data);
  const replayDiagnosticsFreshness = safeReplayDiagnostics ? getReplayDiagnosticsFreshness(safeReplayDiagnostics.generatedAt) : "invalid";
  const lastPersistenceRule = safeReplayDiagnostics?.persistence ? getPersistenceRuleGuidance(safeReplayDiagnostics.persistence.rule) : undefined;
  const lastPersistenceFreshness = safeReplayDiagnostics?.persistence ? getPersistenceFailureFreshness(safeReplayDiagnostics.persistence.observedAt) : "invalid";
  const persistenceHistory = filterPersistenceFailureHistory(safeReplayDiagnostics?.persistence?.history, persistenceHistoryFilter);
  const persistenceRuleRecurrence = getPersistenceRuleRecurrence(persistenceHistory);
  const persistenceFailureTrend = getPersistenceFailureTrend(persistenceHistory);
  const persistenceHistorySummary = getPersistenceHistoryFilterSummary(persistenceHistoryFilter, persistenceHistory.length);
  const persistenceFailureAlert = getPersistenceFailureAlertLevel(persistenceFailureTrend.recentCount, persistenceAlertThresholds);
  const persistenceFilterRestorationNotice = getPersistenceFilterRestorationNotice(persistenceHistoryFilter, persistenceFilterRestored);
  const persistenceThresholdsRestorationNotice = getPersistenceAlertThresholdRestorationNotice(persistenceAlertThresholds, persistenceThresholdsRestored);
  const persistenceFailureAlertExplanation = getPersistenceFailureAlertExplanation(persistenceFailureAlert, persistenceFailureTrend.recentCount, persistenceAlertThresholds);
  const persistenceFailureEscalationNotice = getPersistenceFailureAlertEscalationNotice(previousPersistenceAlertRef.current, persistenceFailureAlert);
  const persistenceAlertAcknowledgmentKey = getPersistenceFailureAlertAcknowledgmentKey(persistenceHistoryFilter, persistenceFailureAlert, persistenceFailureTrend.recentCount);
  const persistenceAlertAcknowledged = isPersistenceFailureAlertAcknowledged(persistenceAlertAcknowledgment, persistenceAlertAcknowledgmentKey);
  const persistenceAlertUnacknowledged = isPersistenceFailureAlertUnacknowledged(persistenceAlertUnacknowledgment, persistenceAlertAcknowledgmentKey);
  const acknowledgePersistenceAlert = () => { if (!persistenceAlertAcknowledgmentKey || persistenceFailureAlert !== "critical") return; setPersistenceAlertAcknowledgment({ filter: persistenceHistoryFilter, level: "critical", recentCount: persistenceFailureTrend.recentCount, acknowledgedAt: new Date().toISOString() }); setPersistenceAlertUnacknowledgment(null); };
  const unacknowledgePersistenceAlert = () => { if (!persistenceAlertAcknowledged) return; setPersistenceAlertAcknowledgment(null); setPersistenceAlertUnacknowledgment({ filter: persistenceHistoryFilter, level: "critical", recentCount: persistenceFailureTrend.recentCount, unacknowledgedAt: new Date().toISOString() }); };
  const exportPersistenceDiagnostics = () => {
    if (!safeReplayDiagnostics?.persistence) { setPersistenceExportFeedback("No trustworthy persistence snapshot is available."); return; }
    const payload = buildPersistenceDiagnosticsExport({ exportedAt: new Date().toISOString(), filter: persistenceHistoryFilter, history: persistenceHistory, trend: persistenceFailureTrend, alert: persistenceFailureAlert, thresholds: persistenceAlertThresholds });
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "proofloan-persistence-diagnostics.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setPersistenceExportFeedback("Exported bounded diagnostics; sensitive row data remains withheld.");
  };
  useEffect(() => {
    if (!persistenceAlertAcknowledgmentKey) return;
    if (persistenceAlertAcknowledgment && !persistenceAlertAcknowledged) setPersistenceAlertAcknowledgment(null);
    if (persistenceAlertUnacknowledgment && !persistenceAlertUnacknowledged) setPersistenceAlertUnacknowledgment(null);
  }, [persistenceAlertAcknowledgment, persistenceAlertAcknowledgmentKey, persistenceAlertAcknowledged, persistenceAlertUnacknowledgment, persistenceAlertUnacknowledged]);
  useEffect(() => { previousPersistenceAlertRef.current = persistenceFailureAlert; }, [persistenceFailureAlert]);
  const replayDiagnosticsRefresh = getReplayDiagnosticsRefreshState({ isFetching: replayDiagnostics.isFetching, isOnline });
  const replayRefreshFeedback = getReplayDiagnosticsRefreshFeedback(replayRefreshOutcome);
  const replayRefreshTimelineSummary = getReplayRefreshTimelineSummary(replayRefreshTimeline);
  const replayRefreshTrend = getReplayRefreshTrend(replayRefreshTimeline);
  const replayRefreshCategoryCounts = getReplayRefreshCategoryCounts(replayRefreshTimeline);
  const replayRefreshCategoryTrends = getReplayRefreshCategoryTrends(replayRefreshTimeline, replayRefreshSeverityThresholds);
  const filteredReplayRefreshTimeline = filterReplayRefreshTimeline(replayRefreshTimeline, replayTimelineFilter);
  useEffect(() => { writeReplayRefreshTimelineFilter(sessionStorageOrUndefined(), replayTimelineFilter); }, [replayTimelineFilter]);
  useEffect(() => { const result = persistReplayRefreshSeverityThresholds(sessionStorageOrUndefined(), replayRefreshSeverityThresholds, replayRefreshSeverityPersistenceAvailable); if (!shouldApplyReplayRefreshPersistenceUpdate({ isMounted: replayRefreshMountedRef.current, persisted: replayRefreshSeverityThresholds, current: replayRefreshSeverityThresholds })) return; setReplayRefreshSeverityPersistenceWarning(previous => previous === result.warning ? previous : result.warning); setReplayRefreshSeverityPersistenceAvailable(previous => previous === result.available ? previous : result.available); setReplayRefreshSeverityPersistenceStatus(previous => previous === result.status ? previous : result.status); }, [replayRefreshSeverityThresholds]);
  useEffect(() => { if (!replayTimelineFilterRestored) return; const timer = window.setTimeout(() => setReplayTimelineFilterRestored(false), 4000); return () => window.clearTimeout(timer); }, [replayTimelineFilterRestored]);
  useEffect(() => { if (!replayRefreshSeverityNotice) return; const timer = window.setTimeout(() => setReplayRefreshSeverityNotice(null), 2500); return () => window.clearTimeout(timer); }, [replayRefreshSeverityNotice]);
  useEffect(() => { if (!replayTimelineFilterChangeNotice) return; const timer = window.setTimeout(() => setReplayTimelineFilterChangeNotice(null), 2500); return () => window.clearTimeout(timer); }, [replayTimelineFilterChangeNotice]);
  const changeReplayTimelineFilter = (next: ReplayRefreshTimelineFilter) => { setReplayTimelineFilterChangeNotice(getReplayRefreshFilterChangeScopeNotice(replayTimelineFilter, next, filterReplayRefreshTimeline(replayRefreshTimeline, next).length) ?? getReplayRefreshFilterChangeNotice(replayTimelineFilter, next)); setReplayTimelineFilter(next); };
  const recordReplayThresholdAudit = (kind: "saved" | "restored", thresholds: { attentionCount: number; criticalCount: number }) => { if (!replayRefreshMountedRef.current) return; setReplayRefreshThresholdAudit(events => appendReplayRefreshThresholdAuditEvent(events, { kind, ...thresholds })); };
  const refreshReplayDiagnostics = () => {
    if (!replayDiagnosticsRefresh.enabled) return;
    const requestId = replayRefreshRequestRef.current + 1;
    replayRefreshRequestRef.current = requestId;
    setReplayRefreshOutcome("refreshing");
    void replayDiagnostics.refetch().then(result => {
      if (!shouldApplyReplayRefreshOutcome({ requestId, currentRequestId: replayRefreshRequestRef.current, isMounted: replayRefreshMountedRef.current })) return;
      const outcome = result.isError ? "error" : "success";
      setReplayRefreshOutcome(outcome);
      setReplayRefreshTimeline(events => appendReplayRefreshTimelineEvent(events, outcome, new Date().toISOString(), Date.now(), result.isError ? categorizeReplayRefreshFailure(result.error) : undefined));
    }).catch(() => {
      if (!shouldApplyReplayRefreshOutcome({ requestId, currentRequestId: replayRefreshRequestRef.current, isMounted: replayRefreshMountedRef.current })) return;
      setReplayRefreshOutcome("error");
      setReplayRefreshTimeline(events => appendReplayRefreshTimelineEvent(events, "error", new Date().toISOString(), Date.now(), categorizeReplayRefreshFailure(undefined)));
    });
  };

  if (!isAdmin) return null;

  return (
                  <section aria-label="Replay protection health" className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">Operator health</div>
                <h2 className="mt-1 text-lg font-bold text-white">Replay protection</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Read-only counts; identifiers and payloads stay hidden.</p><fieldset aria-describedby="replay-severity-guidance replay-severity-status" className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500"><legend className="sr-only">Category severity thresholds. Use the arrow keys to adjust each numeric threshold.</legend><span title="Severity is derived from the bounded recent-event window">Category severity</span><label className="flex items-center gap-1">Attention <input aria-label="Attention threshold" aria-describedby="replay-severity-guidance replay-severity-status" type="number" min={1} max={2} value={replayRefreshSeverityThresholds.attentionCount} onChange={event => { const next = normalizeReplayRefreshSeverityThresholds({ ...replayRefreshSeverityThresholds, attentionCount: Number(event.target.value) }); if (areReplayRefreshSeverityThresholdsEqual(replayRefreshSeverityThresholds, next)) return; setReplayRefreshSeverityThresholds(next); recordReplayThresholdAudit("saved", next); setReplayRefreshSeverityNotice(getReplayRefreshSeverityNotice("saved")); }} className="h-7 w-12 rounded border border-white/10 bg-white/[0.04] px-1 text-center text-slate-200" /></label><label className="flex items-center gap-1">Critical <input aria-label="Critical threshold" aria-describedby="replay-severity-guidance replay-severity-status" type="number" min={2} max={3} value={replayRefreshSeverityThresholds.criticalCount} onChange={event => { const next = normalizeReplayRefreshSeverityThresholds({ ...replayRefreshSeverityThresholds, criticalCount: Number(event.target.value) }); if (areReplayRefreshSeverityThresholdsEqual(replayRefreshSeverityThresholds, next)) return; setReplayRefreshSeverityThresholds(next); recordReplayThresholdAudit("saved", next); setReplayRefreshSeverityNotice(getReplayRefreshSeverityNotice("saved")); }} className="h-7 w-12 rounded border border-white/10 bg-white/[0.04] px-1 text-center text-slate-200" /></label><span id="replay-severity-guidance" className="w-full text-[10px] text-slate-500 sm:w-auto">{getReplayRefreshSeverityExplanation(replayRefreshSeverityThresholds)}</span><span id="replay-severity-status" role="status" aria-live="polite" className="sr-only">{getReplayRefreshSeverityStatusSummary(replayRefreshSeverityThresholds)}{replayRefreshSeverityNotice ? ` ${replayRefreshSeverityNotice}.` : ""}{replayRefreshSeverityPersistenceWarning ? ` ${replayRefreshSeverityPersistenceWarning}` : ""}{replayRefreshSeverityPersistenceStatus ? ` ${replayRefreshSeverityPersistenceStatus}` : ""}</span><button type="button" aria-label="Restore default severity thresholds" onClick={() => { const next = normalizeReplayRefreshSeverityThresholds(); if (areReplayRefreshSeverityThresholdsEqual(replayRefreshSeverityThresholds, next)) return; setReplayRefreshSeverityThresholds(next); recordReplayThresholdAudit("restored", next); setReplayRefreshSeverityNotice(getReplayRefreshSeverityNotice("restored")); }} className="font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-2 hover:text-cyan-100">Restore defaults</button>{replayRefreshSeverityNotice && <span role="status" className="text-cyan-200">{replayRefreshSeverityNotice}</span>}{replayRefreshSeverityPersistenceWarning ? <span role="status" className="w-full text-amber-200 sm:w-auto">{replayRefreshSeverityPersistenceWarning}</span> : replayRefreshSeverityPersistenceStatus && <span role="status" className="w-full text-slate-500 sm:w-auto">{replayRefreshSeverityPersistenceStatus}</span>}</fieldset>
              </div>
              <div className="flex items-start gap-3">
                {safeReplayDiagnostics && <div className="text-right text-[11px] text-slate-500">Updated {formatReplayDiagnosticsTimestamp(safeReplayDiagnostics.generatedAt)}<div className={replayDiagnosticsFreshness === "fresh" ? "text-emerald-300" : "text-amber-200"}>{replayDiagnosticsFreshness === "fresh" ? "Current" : replayDiagnosticsFreshness === "future" ? "Clock skew detected" : "Refresh required"}</div></div>}
                <Button type="button" variant="outline" aria-label={replayDiagnosticsRefresh.label} disabled={!replayDiagnosticsRefresh.enabled} onClick={refreshReplayDiagnostics} className="min-h-9 rounded-lg border-white/15 px-3 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-60"><RefreshCw size={13} className={replayDiagnostics.isFetching ? "animate-spin" : undefined} /> {replayDiagnosticsRefresh.label}</Button><Button type="button" variant="outline" aria-label="Export bounded persistence diagnostics" disabled={!safeReplayDiagnostics?.persistence} onClick={exportPersistenceDiagnostics} className="min-h-9 rounded-lg border-white/15 px-3 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-60">Export JSON</Button>
              </div>
            </div>
            {replayRefreshFeedback.label && replayRefreshOutcome !== "refreshing" && <p role={replayRefreshOutcome === "error" ? "alert" : "status"} className={`mt-4 text-xs ${replayRefreshFeedback.tone === "negative" ? "text-rose-200" : replayRefreshFeedback.tone === "positive" ? "text-emerald-200" : "text-slate-400"}`}>{replayRefreshFeedback.label}</p>}{persistenceExportFeedback && <p role="status" className="mt-2 text-xs text-cyan-200">{persistenceExportFeedback}</p>}
            {replayDiagnostics.isLoading && <p className="mt-4 text-xs text-slate-400">Loading protected diagnostics…</p>}
            {replayRefreshOutcome === "refreshing" && <p role="status" className="mt-4 text-xs text-slate-400">Refreshing protected diagnostics… Last trustworthy snapshot remains visible.</p>}
            {replayDiagnostics.error && <p role="alert" className="mt-4 text-xs text-rose-200">Replay diagnostics are temporarily unavailable.</p>}
            {replayDiagnostics.data && !safeReplayDiagnostics && <p role="alert" className="mt-4 text-xs text-amber-100">Replay diagnostics returned an invalid payload and are being withheld.</p>}
            {lastPersistenceRule && safeReplayDiagnostics?.persistence && <div role="status" className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-amber-100">Last snapshot rejection</span><span className="flex items-center gap-2"><code className="font-mono text-[10px] text-amber-200">{lastPersistenceRule.rule}</code><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200">{lastPersistenceFreshness === "fresh" ? "Current" : lastPersistenceFreshness === "stale" ? "Stale" : "Review"}</span></span></div>{persistenceFilterRestorationNotice && <p role="status" className="mt-2 text-[11px] text-cyan-200">{persistenceFilterRestorationNotice}</p>}<div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500"><span>Alert thresholds</span><label className="flex items-center gap-1">Watch <input aria-label="Watch recurrence threshold" className="w-12 rounded border border-white/10 bg-black/20 px-1 py-1 text-center text-slate-200" type="number" min="1" max="5" value={persistenceAlertThresholds.watchCount} onChange={event => { setPersistenceAlertThresholds(normalizePersistenceFailureAlertThresholds({ ...persistenceAlertThresholds, watchCount: Number(event.target.value) })); setPersistenceThresholdsRestored(false); }} /></label><label className="flex items-center gap-1">Critical <input aria-label="Critical recurrence threshold" className="w-12 rounded border border-white/10 bg-black/20 px-1 py-1 text-center text-slate-200" type="number" min="2" max="6" value={persistenceAlertThresholds.criticalCount} onChange={event => { setPersistenceAlertThresholds(normalizePersistenceFailureAlertThresholds({ ...persistenceAlertThresholds, criticalCount: Number(event.target.value) })); setPersistenceThresholdsRestored(false); }} /></label><button type="button" className="text-cyan-200 underline decoration-cyan-200/30 underline-offset-2" onClick={() => { setPersistenceAlertThresholds(DEFAULT_PERSISTENCE_FAILURE_ALERT_THRESHOLDS); setPersistenceThresholdsRestored(false); }}>Reset</button></div>{persistenceThresholdsRestorationNotice && <p role="status" className="mt-2 text-[11px] text-cyan-200">{persistenceThresholdsRestorationNotice}</p>}{persistenceFailureEscalationNotice && !persistenceAlertAcknowledged && <div role="alert" className="mt-2 flex flex-wrap items-center gap-2"><p className="text-[11px] font-semibold text-rose-200">{persistenceFailureEscalationNotice}</p><button type="button" className="rounded border border-rose-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-rose-100 hover:bg-rose-300/10" onClick={acknowledgePersistenceAlert}>Acknowledge for session</button></div>}{persistenceAlertAcknowledged && <div role="status" className="mt-2 flex flex-wrap items-center gap-2"><p className="text-[11px] text-cyan-200">{getPersistenceFailureAlertAcknowledgmentNotice(persistenceHistoryFilter, persistenceFailureTrend.recentCount, persistenceAlertAcknowledgment?.acknowledgedAt)}</p><button type="button" className="rounded border border-cyan-300/25 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-cyan-100 hover:bg-cyan-300/10" onClick={unacknowledgePersistenceAlert}>Unacknowledge</button></div>}{persistenceAlertUnacknowledged && !persistenceAlertAcknowledged && <p role="status" className="mt-2 text-[11px] text-amber-200">{getPersistenceFailureAlertUnacknowledgmentNotice(persistenceHistoryFilter, persistenceFailureTrend.recentCount, persistenceAlertUnacknowledgment?.unacknowledgedAt)}</p>}<p className="mt-2 text-[10px] text-slate-500" role="status">{persistenceHistorySummary}</p><p className="mt-2 text-[11px] leading-5 text-amber-100/75">{lastPersistenceRule.guidance}</p><p className="mt-2 text-[10px] text-slate-500">Observed {formatReplayDiagnosticsTimestamp(safeReplayDiagnostics.persistence.observedAt)}. Sensitive row data is withheld.</p><div className="mt-3 flex flex-wrap gap-1" aria-label="Persistence failure history filter">{(["all", "current", "stale"] as const).map(filter => <button key={filter} type="button" onClick={() => { setPersistenceHistoryFilter(filter); setPersistenceFilterRestored(false); }} className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${persistenceHistoryFilter === filter ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-500 hover:text-slate-300"}`}>{filter}</button>)}</div><div className="mt-3 flex flex-wrap gap-2" aria-label="Recent persistence failure rules">{persistenceHistory.map((entry, index) => { const freshness = getPersistenceFailureFreshness(entry.observedAt); return <span key={`${entry.observedAt}-${index}`} title={`${formatReplayDiagnosticsTimestamp(entry.observedAt)} · ${freshness}`} className="rounded-full border border-amber-300/15 bg-amber-300/5 px-2 py-1 font-mono text-[10px] text-amber-200">{entry.rule} · {freshness === "fresh" ? "current" : freshness === "stale" ? "stale" : "review"}</span>; })}</div><div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Persistence failure recurrence counts"><span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Trend</span><span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${persistenceFailureTrend.direction === "rising" ? "border-rose-300/20 text-rose-200" : persistenceFailureTrend.direction === "falling" ? "border-emerald-300/20 text-emerald-200" : "border-white/10 text-slate-400"}`}>{persistenceFailureTrend.direction}</span><span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${persistenceFailureAlert === "critical" ? "border-rose-300/30 text-rose-200" : persistenceFailureAlert === "watch" ? "border-amber-300/30 text-amber-200" : "border-white/10 text-slate-400"}`}>{getPersistenceFailureAlertLabel(persistenceFailureAlert)}</span><span className="text-[10px] uppercase tracking-[0.12em] text-slate-500" aria-label="Persistence alert scope">{persistenceHistoryFilter} scope</span></div><p className="mt-2 text-[11px] leading-5 text-slate-400">{persistenceFailureAlertExplanation}</p><div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Persistence failure recurrence counts">{persistenceRuleRecurrence.map(entry => <span key={entry.rule} className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[10px] text-slate-300">{entry.rule}: {entry.count}</span>)}</div></div>}
            <details className="mt-4 rounded-xl border border-white/10 bg-[#0d1622] p-3">
              <summary className="cursor-pointer text-xs font-semibold text-slate-200">Persistence rule guide</summary>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">Read-only remediation guidance. Rule IDs contain no wallet, payload, or evidence data.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{PERSISTENCE_RULE_GUIDANCE.map(entry => <div key={entry.rule} className="rounded-lg border border-white/10 bg-black/10 p-2"><div className="font-mono text-[10px] text-cyan-200">{entry.rule}</div><div className="mt-1 text-[11px] font-semibold text-slate-300">{entry.label}</div><p className="mt-1 text-[11px] leading-5 text-slate-500">{entry.guidance}</p></div>)}</div>
            </details>
            {safeReplayDiagnostics && <div className="mt-4 grid gap-3 sm:grid-cols-2">{getReplayDiagnosticsRows(safeReplayDiagnostics, replayDiagnosticsFreshness).map(row => <div key={row.label} className="rounded-xl border border-white/10 bg-[#0d1622] p-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-200">{row.label}</span><span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${row.tone === "attention" ? "text-amber-200" : "text-emerald-300"}`}>{row.tone === "attention" ? "Attention" : "Clear"}</span></div><div className="mt-3 flex items-end justify-between"><div><div className="text-2xl font-black text-white">{row.pending}</div><div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Pending</div></div><div className="text-right"><div className="text-lg font-bold text-cyan-200">{row.stale}</div><div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Stale</div></div></div></div>)}</div>}
            {(replayRefreshTimeline.length > 0 || replayRefreshThresholdAudit.length > 0) && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Recent refresh attempts</h3>{replayTimelineFilter !== "all" && <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2 py-0.5 text-[10px] font-medium text-cyan-200" aria-label={`Active timeline filter: ${getReplayRefreshFilterScopeLabel(replayTimelineFilter, filteredReplayRefreshTimeline.length)}`}>Viewing {getReplayRefreshFilterScopeLabel(replayTimelineFilter, filteredReplayRefreshTimeline.length)}</span>}</div>
                    <span className="text-[10px] text-slate-500">Last six · no identifiers</span>{replayTimelineFilterChangeNotice && <span role="status" className="mt-1 block text-[10px] text-cyan-200">{replayTimelineFilterChangeNotice}</span>}{getReplayRefreshFilterRestorationNotice(replayTimelineFilter, replayTimelineFilterRestored) && <span role="status" className="mt-1 block text-[10px] text-cyan-200">{getReplayRefreshFilterRestorationNotice(replayTimelineFilter, replayTimelineFilterRestored)}</span>}{replayTimelineFilter !== "all" && <button type="button" onClick={() => changeReplayTimelineFilter("all")} className="mt-2 block text-[10px] font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-2 hover:text-cyan-100">Reset filter</button>}
                  </div>
                  <div className="flex flex-wrap rounded-full border border-white/10 p-0.5" role="group" aria-label="Filter refresh attempts">{(["all", "failures", "unavailable", "malformed", "request_error"] as const).map(filter => <button key={filter} type="button" aria-pressed={replayTimelineFilter === filter} onClick={() => changeReplayTimelineFilter(filter)} className={`rounded-full px-2 py-1 text-[10px] font-semibold ${replayTimelineFilter === filter ? "bg-white/10 text-white" : "text-slate-500"}`}>{filter === "all" ? "All" : filter === "failures" ? "Failures" : getReplayRefreshFailureLabel(filter)}</button>)}</div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${replayRefreshTimelineSummary.status === "critical" ? "text-rose-200" : replayRefreshTimelineSummary.status === "watch" ? "text-amber-200" : "text-emerald-300"}`}>{replayRefreshTimelineSummary.failureRatePercent}% failed</div>
                    <div className="text-[10px] text-slate-500">{replayRefreshTimelineSummary.failures}/{replayRefreshTimelineSummary.attempts} attempts</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${replayRefreshTrend.direction === "rising" ? "text-rose-200" : replayRefreshTrend.direction === "falling" ? "text-emerald-200" : "text-slate-300"}`}>{replayRefreshTrend.direction === "insufficient" ? "Trend pending" : replayRefreshTrend.direction === "rising" ? "Failure trend rising" : replayRefreshTrend.direction === "falling" ? "Failure trend falling" : "Failure trend flat"}</div>
                    {replayRefreshTrend.direction !== "insufficient" && <div className="text-[10px] text-slate-500">{replayRefreshTrend.priorFailureRatePercent}% → {replayRefreshTrend.recentFailureRatePercent}% · {replayRefreshTrend.confidence} confidence</div>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{replayRefreshCategoryCounts.filter(item => item.count > 0).map(item => { const trend = replayRefreshCategoryTrends.find(candidate => candidate.category === item.category); const direction = trend?.direction === "rising" ? "↑" : trend?.direction === "falling" ? "↓" : trend?.direction === "flat" ? "→" : "·"; return <span key={item.category} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400" aria-label={`${item.label}: ${item.count}; trend ${trend?.direction ?? "insufficient"}`}>{item.label}: {item.count} {direction}</span>; })}</div>
                {filteredReplayRefreshTimeline.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-3 text-xs text-slate-500" role="status">No matching refresh attempts in the current window. {shouldShowReplayRefreshFilterReset({ filter: replayTimelineFilter, visibleCount: filteredReplayRefreshTimeline.length }) && <button type="button" onClick={() => changeReplayTimelineFilter("all")} className="ml-1 font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-2 hover:text-cyan-100">View all attempts</button>}</p> : <ol aria-label="Recent replay diagnostics refresh attempts" className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[...filteredReplayRefreshTimeline].reverse().map(event => <li key={event.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d1622] px-3 py-2"><span className={`h-2 w-2 shrink-0 rounded-full ${event.outcome === "success" ? "bg-emerald-300" : "bg-rose-300"}`} /><span className="min-w-0 text-xs text-slate-300">{event.outcome === "success" ? "Refresh completed" : getReplayRefreshFailureLabel(event.category)}</span><time className="ml-auto shrink-0 text-[10px] text-slate-500">{formatReplayDiagnosticsTimestamp(event.occurredAt)}</time></li>)}</ol>}
                {replayRefreshThresholdAudit.length > 0 && <div className="mt-4 border-t border-white/10 pt-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Recent operator changes</div><ol aria-label="Recent replay severity threshold changes" className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{[...replayRefreshThresholdAudit].reverse().map(event => <li key={event.id} aria-label={getReplayRefreshThresholdAuditAriaLabel(event)} className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.03] px-3 py-2"><div className="text-xs text-slate-300">{getReplayRefreshThresholdAuditLabel(event)}</div><div className="mt-1 text-[10px] text-slate-500">Attention {event.attentionCount} · Critical {event.criticalCount}<time className="ml-2">{formatReplayDiagnosticsTimestamp(event.occurredAt)}</time></div></li>)}</ol><p className="mt-2 text-[10px] text-slate-600">Bounded session view; no identities, payloads, or raw diagnostics are recorded.</p></div>}
              </div>
            )}
          </section>

  );
}
