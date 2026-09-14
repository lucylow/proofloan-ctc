import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  shortenAddress,
  useDappWallet,
} from "@/hooks/useDappWallet";
import { copyToClipboardSafe } from "@/hardening/safeClipboard";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletButton() {
  const {
    state,
    wallet,
    error,
    connect,
    disconnect,
    switchToSepolia,
  } = useDappWallet();

  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!wallet?.address) {
      return;
    }

    const copiedResult = await copyToClipboardSafe(wallet.address);
    if (!copiedResult.ok) {
      toast.error(copiedResult.error.userMessage);
      return;
    }

    setCopied(true);
    toast.success("Wallet address copied.");

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (state === "connecting") {
    return (
      <Button
        variant="outline"
        disabled
        className="h-10 rounded-xl gap-2"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting
      </Button>
    );
  }

  if (!wallet || state === "disconnected" || state === "error") {
    return (
      <Button
        onClick={connect}
        className="h-10 rounded-xl gap-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
      >
        <Wallet className="h-4 w-4" />
        <span className="sm:hidden">Connect</span>
        <span className="hidden sm:inline">Connect wallet</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-xl gap-2 border-white/10 bg-white/[0.03]"
        >
          <span
            className={[
              "h-2 w-2 rounded-full pl-status-live",
              state === "wrong-network"
                ? "bg-amber-400"
                : "bg-emerald-400",
            ].join(" ")}
          />

          <span className="font-mono text-xs">
            {shortenAddress(wallet.address)}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border-white/10 bg-[#0b121d] text-slate-100"
      >
        <DropdownMenuLabel className="pb-3">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Connected wallet
          </div>

          <div className="mt-2 break-all font-mono text-xs text-slate-300">
            {wallet.address}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-3 rounded-xl"
          onClick={copyAddress}
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy address"}
        </DropdownMenuItem>

        {state === "wrong-network" && (
          <DropdownMenuItem
            className="gap-3 rounded-xl text-amber-200"
            onClick={switchToSepolia}
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to Sepolia
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="gap-3 rounded-xl text-rose-300 focus:text-rose-300"
          onClick={disconnect}
        >
          <X className="h-4 w-4" />
          Disconnect UI session
        </DropdownMenuItem>

        {error && (
          <>
            <DropdownMenuSeparator />

            <div className="px-3 py-2 text-xs leading-5 text-rose-300">
              {error}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
