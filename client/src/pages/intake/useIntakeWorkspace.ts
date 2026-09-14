import { useEffect, useMemo, useRef, useState } from "react";

import { trpc } from "@/lib/trpc";
import {
  clearStoredApplicationId,
  getSafeSessionStorage,
  persistApplicationId,
  readStoredApplicationId,
} from "@/lib/applicationSession";
import { scheduleFeedbackReset, type FeedbackTimer } from "@/lib/transientFeedback";
import { isDashboardFailureDebugEnabled } from "@/lib/mobileDebug";
import {
  getAcceptanceFailureRecovery,
  getMobileActionAvailability,
  getMobileCreditFileViewState,
  shouldClearMissingApplication,
  shouldInvokeMobileAction,
  shouldPollCreditFile,
  shouldRetryCreditFileQuery,
} from "@/lib/mobileRecoveryState";
import {
  getAcceptanceIdempotencyRef,
  type AcceptanceIdempotencyRef,
} from "@/lib/acceptanceIdempotency";
import { getProofRequestIdempotencyKey } from "@/lib/proofRequestIdempotency";
import { getProofIdentityValidationError } from "@/lib/proofIdentityValidation";
import { useOnlineStatus } from "@/hardening/onlineStatus";
import {
  getProofMode,
  getProofModeLabel,
  PROOFLOAN_STATES,
  type SourceChain,
} from "@shared/proofloan";

export function useIntakeWorkspace() {
  const isOnline = useOnlineStatus();
  const [walletAddress, setWalletAddress] = useState("");
  const [sourceTransactionHash, setSourceTransactionHash] = useState("");
  const [sourceChain, setSourceChain] = useState<SourceChain>("Ethereum Sepolia");
  const [applicationId, setApplicationId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : readStoredApplicationId(getSafeSessionStorage(() => window.sessionStorage)),
  );
  const [copied, setCopied] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState("apply");
  const [activeTab, setActiveTab] = useState("evidence");
  const [debugDashboardFailure, setDebugDashboardFailure] = useState(() =>
    isDashboardFailureDebugEnabled(
      import.meta.env.DEV,
      typeof window === "undefined" ? "" : window.location.search,
    ),
  );
  const [inputError, setInputError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyResetTimer = useRef<FeedbackTimer | null>(null);
  const acceptanceIdempotencyRef = useRef<AcceptanceIdempotencyRef | null>(null);
  const proofRequestIdempotencyRef = useRef<ReturnType<
    typeof getProofRequestIdempotencyKey
  > | null>(null);
  const [pollingPaused, setPollingPaused] = useState(false);

  useEffect(
    () => () => {
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storage = getSafeSessionStorage(() => window.sessionStorage);
    if (applicationId) persistApplicationId(storage, applicationId);
    else clearStoredApplicationId(storage);
  }, [applicationId]);

  useEffect(() => {
    document.title = "Start a loan · ProofLoan";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const wallet = params.get("wallet");
    const chain = params.get("chain");
    if (wallet) setWalletAddress(wallet);
    if (
      chain === "Ethereum Sepolia" ||
      chain === "Ethereum Mainnet" ||
      chain === "Polygon Amoy"
    ) {
      setSourceChain(chain);
    }
    if (wallet || window.location.hash === "#apply") {
      setActiveSection("apply");
      window.requestAnimationFrame(() => {
        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const proofloanUtils = trpc.useUtils();
  const createApplication = trpc.proofloan.createApplication.useMutation({
    onMutate: () => {
      setProofSubmitted(false);
      setInputError(null);
    },
    onSuccess: data => {
      acceptanceIdempotencyRef.current = null;
      setApplicationId(data.applicationId);
      setPollingPaused(false);
      setProofSubmitted(true);
    },
  });
  const acceptOffer = trpc.proofloan.acceptOffer.useMutation({
    onMutate: () => setOfferSubmitted(false),
    onSuccess: () => setOfferSubmitted(true),
    onError: (_error, variables) => {
      const recovery = getAcceptanceFailureRecovery({
        hasApplication: Boolean(variables.applicationId),
        isOnline,
        pollingPaused,
      });
      if (recovery.shouldInvalidateCreditFile) {
        if (recovery.shouldResumePolling) setPollingPaused(false);
        void proofloanUtils.proofloan.getApplication
          .invalidate({ applicationId: variables.applicationId })
          .catch(() => undefined);
      }
    },
  });
  const applicationQuery = trpc.proofloan.getApplication.useQuery(
    { applicationId: applicationId ?? "_none_" },
    {
      enabled: Boolean(applicationId) && !pollingPaused,
      retry: (_failureCount, _error) =>
        shouldRetryCreditFileQuery({
          isOnline,
          pollingPaused,
          failureCount: _failureCount,
        }),
      refetchInterval: shouldPollCreditFile({
        hasApplication: Boolean(applicationId),
        isOnline,
        pollingPaused,
      })
        ? 5000
        : false,
    },
  );
  const app = applicationQuery.data;
  const proofMode = getProofMode(app?.sourceTransactionHash, app?.sourceChain);
  const proofModeLabel = getProofModeLabel(proofMode);

  useEffect(() => {
    if (applicationQuery.error) setPollingPaused(true);
  }, [applicationQuery.error]);

  useEffect(() => {
    if (
      shouldClearMissingApplication({
        hasApplicationId: Boolean(applicationId),
        hasData: applicationQuery.data !== undefined,
        isLoading: applicationQuery.isLoading,
        isFetching: applicationQuery.isFetching,
        hasError: Boolean(applicationQuery.error),
      }) &&
      applicationQuery.data === null
    ) {
      setApplicationId(null);
      setPollingPaused(false);
      setProofSubmitted(false);
    }
  }, [
    applicationId,
    applicationQuery.data,
    applicationQuery.error,
    applicationQuery.isFetching,
    applicationQuery.isLoading,
  ]);

  const actionAvailability = getMobileActionAvailability({
    isOnline,
    proofPending: createApplication.isPending,
    refreshPending: applicationQuery.isFetching,
    acceptPending: acceptOffer.isPending,
  });
  const creditFileViewState = getMobileCreditFileViewState({
    hasApplication: Boolean(app),
    isLoading: applicationQuery.isLoading,
    hasError: Boolean(debugDashboardFailure || applicationQuery.error),
  });
  const currentIndex = useMemo(
    () => PROOFLOAN_STATES.indexOf(app?.state ?? "Intake"),
    [app?.state],
  );

  const startProof = () => {
    if (
      !shouldInvokeMobileAction({
        action: "proof",
        isOnline,
        pending: createApplication.isPending,
        hasApplication: Boolean(applicationId),
      })
    ) {
      return;
    }
    const validationError = getProofIdentityValidationError(
      walletAddress,
      sourceTransactionHash,
      sourceChain,
    );
    if (validationError) {
      setInputError(validationError);
      return;
    }
    setInputError(null);
    proofRequestIdempotencyRef.current = getProofRequestIdempotencyKey(
      proofRequestIdempotencyRef.current,
      walletAddress,
      sourceChain,
      undefined,
      sourceTransactionHash,
    );
    createApplication.mutate({
      walletAddress: walletAddress.trim(),
      sourceTransactionHash: sourceTransactionHash.trim() || undefined,
      sourceChain,
      idempotencyKey: proofRequestIdempotencyRef.current.key,
    });
  };

  const copyId = async () => {
    if (!app) return;
    setCopyError(null);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable on this device.");
      }
      await navigator.clipboard.writeText(app.applicationId);
      setCopied(true);
      copyResetTimer.current = scheduleFeedbackReset(
        setTimeout,
        clearTimeout,
        copyResetTimer.current,
        () => {
          setCopied(false);
          copyResetTimer.current = null;
        },
        1200,
      );
    } catch (error) {
      setCopied(false);
      setCopyError(
        error instanceof Error
          ? error.message
          : "Clipboard access was unavailable.",
      );
    }
  };

  const refreshCreditFile = () => {
    if (
      !applicationId ||
      !shouldInvokeMobileAction({
        action: "refresh",
        isOnline,
        pending: applicationQuery.isFetching,
        hasApplication: Boolean(applicationId),
      })
    ) {
      return;
    }
    setDebugDashboardFailure(false);
    setPollingPaused(false);
    void applicationQuery.refetch().catch(() => undefined);
  };

  const submitOffer = () => {
    if (
      !app ||
      !shouldInvokeMobileAction({
        action: "accept",
        isOnline,
        pending: acceptOffer.isPending,
        hasApplication: Boolean(app),
      })
    ) {
      return;
    }
    acceptanceIdempotencyRef.current = getAcceptanceIdempotencyRef(
      acceptanceIdempotencyRef.current,
      app.applicationId,
    );
    acceptOffer.mutate({
      applicationId: app.applicationId,
      idempotencyKey: acceptanceIdempotencyRef.current.key,
    });
  };

  const scrollToApply = () => {
    setActiveSection("apply");
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
  };

  return {
    isOnline,
    walletAddress,
    setWalletAddress,
    sourceTransactionHash,
    setSourceTransactionHash,
    sourceChain,
    setSourceChain,
    copied,
    proofSubmitted,
    offerSubmitted,
    activeSection,
    setActiveSection,
    activeTab,
    setActiveTab,
    debugDashboardFailure,
    inputError,
    copyError,
    actionAvailability,
    creditFileViewState,
    currentIndex,
    app,
    proofMode,
    proofModeLabel,
    createApplication,
    acceptOffer,
    applicationQuery,
    startProof,
    copyId,
    refreshCreditFile,
    submitOffer,
    scrollToApply,
  };
}

export type IntakeWorkspace = ReturnType<typeof useIntakeWorkspace>;
