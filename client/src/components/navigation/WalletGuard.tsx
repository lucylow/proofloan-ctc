import { ReactNode } from "react";
import { WalletCards } from "lucide-react";
import { useDappWallet } from "@/hooks/useDappWallet";
import { Button } from "@/components/ui/button";

export function WalletGuard({ children, requireSupportedNetwork = true }: { children: ReactNode; requireSupportedNetwork?: boolean }) {
  const wallet = useDappWallet();

  if (wallet.state === "connecting") {
    return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-xs text-slate-500">Connecting wallet…</div>;
  }

  if (!wallet.wallet) {
    return (
      <div className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.03] p-6 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
          <WalletCards className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="mt-4 text-sm font-semibold text-white">Connect a wallet</div>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">A wallet is required before blockchain-backed actions become available.</p>
        <Button onClick={wallet.connect} className="mt-5 rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200">Connect wallet</Button>
      </div>
    );
  }

  if (requireSupportedNetwork && wallet.isWrongNetwork) {
    return (
      <div className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.035] p-6 text-center">
        <div className="text-sm font-semibold text-white">Switch to a supported network</div>
        <p className="mt-2 text-xs leading-5 text-slate-600">Current network: {wallet.wallet.chainName}</p>
        <Button onClick={wallet.switchToSepolia} variant="outline" className="mt-5 rounded-xl">Switch network</Button>
      </div>
    );
  }

  return <>{children}</>;
}
