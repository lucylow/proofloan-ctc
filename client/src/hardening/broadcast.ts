export type BroadcastMessage = {
  type: string;
  payload?: unknown;
};

export class SafeBroadcast {
  private channel?: BroadcastChannel;

  constructor(private readonly name: string) {
    try {
      if (typeof BroadcastChannel !== "undefined") this.channel = new BroadcastChannel(name);
    } catch {
      this.channel = undefined;
    }
  }

  send(message: BroadcastMessage) {
    try {
      this.channel?.postMessage(message);
    } catch {
      // cross-tab sync is best effort
    }
  }

  subscribe(listener: (message: BroadcastMessage) => void) {
    if (!this.channel) return () => undefined;
    const handler = (event: MessageEvent<BroadcastMessage>) => listener(event.data);
    this.channel.addEventListener("message", handler);
    return () => this.channel?.removeEventListener("message", handler);
  }

  close() {
    try {
      this.channel?.close();
    } catch {
      // no-op
    }
  }
}
