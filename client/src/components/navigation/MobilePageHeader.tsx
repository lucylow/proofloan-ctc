import {
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  backPath?: string;
};

export function MobilePageHeader({
  title,
  backPath,
}: Props) {
  const [, navigate] = useLocation();

  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 flex h-14 items-center border-b border-white/[0.06] bg-[#070b12]/90 px-4 backdrop-blur-xl lg:hidden">
      {backPath ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={() => navigate(backPath)}
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-9" />
      )}

      <div className="flex-1 truncate px-3 text-center text-sm font-semibold text-white">
        {title}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl"
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
