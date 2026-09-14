import { ReactNode } from "react";
import { DemoErrorBoundary } from "@/demo/DemoErrorBoundary";

export function DemoSafeCard({ children }: { children: ReactNode }) {
  return <DemoErrorBoundary>{children}</DemoErrorBoundary>;
}
