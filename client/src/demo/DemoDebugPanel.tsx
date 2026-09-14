import {
  Database,
  Download,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

import { Button } from "@/components/ui/button";

export function DemoDebugPanel() {
  const { data } = useDemo();

  const downloadJson = () => {
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      `proofloan-demo-${data.scenario}.json`;

    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <Database className="h-4 w-4 text-violet-300" />

        <div className="text-sm font-semibold text-white">
          Demo dataset
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Applications", data.applications.length],
          ["Evidence", data.evidence.length],
          ["Offers", data.offers.length],
          ["Activity", data.activity.length],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl bg-white/[0.03] p-3"
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-600">
              {label}
            </div>

            <div className="mt-1 text-lg font-bold text-white">
              {value}
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4 rounded-xl"
        onClick={downloadJson}
      >
        <Download className="mr-2 h-3.5 w-3.5" />
        Export demo JSON
      </Button>
    </section>
  );
}
