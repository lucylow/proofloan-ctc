import {
  FileSearch,
  ArrowLeft,
} from "lucide-react";

import { Link } from "wouter";

import { Button } from "@/components/ui/button";

export function ApplicationNotFound({
  applicationId,
}: {
  applicationId: string;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-8 text-center sm:p-12">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04]">
        <FileSearch className="h-6 w-6 text-slate-600" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        Application not found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        No accessible ProofLoan application was found for{" "}
        <span className="font-mono text-slate-400">
          {applicationId}
        </span>
        .
      </p>

      <Button
        asChild
        variant="outline"
        className="mt-6 rounded-xl"
      >
        <Link href="/applications">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to applications
        </Link>
      </Button>
    </div>
  );
}
