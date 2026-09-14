import {
  FileCheck2,
  PlusCircle,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Link } from "wouter";

import { useDemo } from "@/demo/DemoProvider";

export function QuickActions() {
  const { data } = useDemo();
  const offerCount = data.offers.length;

  const actions = [
    {
      label: "New application",
      description: "Start a proof-backed loan",
      path: "/borrow",
      icon: PlusCircle,
    },
    offerCount > 0
      ? {
          label: "Review offers",
          description: `${offerCount} ready for acceptance`,
          path: "/offers",
          icon: Sparkles,
        }
      : {
          label: "View credit file",
          description: "Review verified features",
          path: "/credit-file",
          icon: WalletCards,
        },
    {
      label: "Inspect evidence",
      description: "Open the evidence graph",
      path: "/evidence",
      icon: FileCheck2,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map(action => {
        const Icon = action.icon;

        return (
          <Link
            key={action.path}
            href={action.path}
            className="pl-panel pl-panel-interactive flex min-h-[4.5rem] items-center gap-3 rounded-2xl px-4"
          >
            <div className="pl-icon-well">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">
                {action.label}
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {action.description}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
