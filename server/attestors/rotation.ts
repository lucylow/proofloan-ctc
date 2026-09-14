import type { AttestorProfile } from "@shared/attestors";
import { AttestorScheduler, type SchedulerConfig } from "./scheduler";

export class AttestorRotationManager {
  readonly scheduler: AttestorScheduler;
  constructor(config?: SchedulerConfig) { this.scheduler = new AttestorScheduler(config); }
  shouldRotate(chain: string, now = Date.now()): boolean { return this.scheduler.dueChains(now).includes(chain); }
  rotate(chain: string, profiles: AttestorProfile[], now = new Date()) { return this.scheduler.schedule(chain, profiles, now); }
}
