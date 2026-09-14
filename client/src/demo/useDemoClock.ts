import {
  useEffect,
  useState,
} from "react";

export function useDemoClock() {
  const [now, setNow] = useState(
    () => Date.now(),
  );

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        setNow(Date.now());
      },
      30_000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return new Date(now);
}

export function relativeTime(
  isoDate: string,
) {
  const difference =
    Date.now() -
    new Date(isoDate).getTime();

  const minutes = Math.floor(
    difference / 60_000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  return `${days}d ago`;
}
