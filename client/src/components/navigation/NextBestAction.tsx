import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { useDemo } from "@/demo/DemoProvider";
import { getNextBestAction } from "@/navigation/applicationState";

export function NextBestAction() {
  const { data } = useDemo();
  const action = getNextBestAction(data);

  return (
    <section className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] via-transparent to-transparent p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            {action.eyebrow}
          </div>

          <h2 className="mt-2 text-lg font-semibold text-white">
            {action.title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {action.description}
          </p>
        </div>

        <Button
          asChild
          className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
