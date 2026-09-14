import { useCallback, useEffect, useState } from "react";
import { useOnlineStatus } from "./onlineStatus";

export function useNetworkRecovery(onReconnect?: () => void | Promise<void>) {
  const online = useOnlineStatus();
  const [recovering, setRecovering] = useState(false);

  const recover = useCallback(async () => {
    if (!online || !onReconnect) return;
    setRecovering(true);
    try {
      await onReconnect();
    } finally {
      setRecovering(false);
    }
  }, [onReconnect, online]);

  useEffect(() => {
    if (online) void recover();
  }, [online, recover]);

  return { online, recovering, recover };
}
