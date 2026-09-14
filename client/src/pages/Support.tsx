import {
  AlertCircle,
  ArrowRight,
  CircleHelp,
  MessageSquare,
  ShieldQuestion,
} from "lucide-react";

import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <PageShell
      eyebrow="Resources"
      title="Support"
      description="Common recovery paths for wallet, proof, application and interface issues."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SupportCard
          icon={ShieldQuestion}
          title="Wallet problem"
          text="Your wallet is disconnected, unavailable or connected to an unsupported network."
          href="/settings"
        />

        <SupportCard
          icon={AlertCircle}
          title="Proof verification issue"
          text="A proof request can be retried without changing an existing application identifier."
          href="/evidence"
        />

        <SupportCard
          icon={CircleHelp}
          title="Application state"
          text="Review the application timeline to see which stage last completed successfully."
          href="/applications"
        />

        <SupportCard
          icon={MessageSquare}
          title="Documentation"
          text="Review architecture and lifecycle documentation before retrying a failed workflow."
          href="/docs"
        />
      </div>
    </PageShell>
  );
}

function SupportCard({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: typeof ShieldQuestion;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="pl-panel pl-panel-interactive group rounded-3xl p-6"
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04]">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>

      <div className="mt-5 text-lg font-semibold text-white">
        {title}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

      <Button
        variant="ghost"
        className="mt-5 rounded-xl px-0 text-cyan-300 hover:bg-transparent hover:text-cyan-200"
      >
        Open
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </Link>
  );
}
