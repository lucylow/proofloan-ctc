import { Button } from "@/components/ui/button";
import { AlertCircle, LayoutDashboard, ListChecks } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#070b12] px-6 text-slate-100">
      <div className="w-full max-w-lg pl-panel rounded-3xl p-8 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-400/10">
          <AlertCircle className="h-8 w-8 text-rose-300" />
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
          ProofLoan
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          That route is not part of the ProofLoan workspace. Return to the dashboard to continue underwriting.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" id="not-found-button-group">
          <Button
            asChild
            className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/applications">
              <ListChecks className="mr-2 h-4 w-4" />
              Applications
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
