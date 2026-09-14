import {
  Bell,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { useDemo } from "@/demo/DemoProvider";
import { relativeTime } from "@/demo/useDemoClock";
import { navigateSafely } from "@/hardening/safeNavigation";
import type { DemoNotification } from "@/demo/types";

const severityIcon = {
  success: CheckCircle2,
  info: Info,
  warning: ShieldAlert,
  error: ShieldAlert,
};

const severityTone = {
  success: "text-emerald-300 bg-emerald-400/10",
  info: "text-cyan-300 bg-cyan-300/10",
  warning: "text-amber-300 bg-amber-400/10",
  error: "text-rose-300 bg-rose-400/10",
};

function notificationHref(notification: DemoNotification) {
  const title = notification.title.toLowerCase();

  if (title.includes("offer")) {
    return "/offers";
  }

  if (title.includes("evidence")) {
    return "/evidence";
  }

  if (title.includes("wallet")) {
    return "/dashboard";
  }

  if (title.includes("policy") || title.includes("application")) {
    return "/applications";
  }

  return "/activity";
}

export function NotificationCenter() {
  const { data } = useDemo();
  const [, navigate] = useLocation();
  const notifications = data.notifications;
  const [readIds, setReadIds] = useState<string[]>([]);

  const items = useMemo(
    () =>
      notifications.map(notification => ({
        ...notification,
        read: notification.read || readIds.includes(notification.id),
      })),
    [notifications, readIds],
  );

  const unreadCount = items.filter(item => !item.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[9px] font-bold text-slate-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border-white/10 bg-[#0b121d]"
      >
        <DropdownMenuLabel className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">
              Notifications
            </div>

            <div className="mt-1 text-xs font-normal text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread workspace event${unreadCount === 1 ? "" : "s"}`
                : "You're caught up"}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="text-[10px] font-semibold text-cyan-200 hover:text-cyan-100"
              onClick={() => setReadIds(notifications.map(item => item.id))}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="space-y-1 p-1">
          {items.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-slate-400">
              No notifications in this demo scenario.
            </div>
          ) : (
            items.slice(0, 6).map(notification => {
                const Icon = severityIcon[notification.severity];

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      setReadIds(current =>
                        current.includes(notification.id)
                          ? current
                          : [...current, notification.id],
                      );
                      navigateSafely(navigate, notificationHref(notification));
                    }}
                    className={[
                      "flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/[0.04]",
                      notification.read
                        ? "opacity-60"
                        : "bg-cyan-300/[0.03]",
                    ].join(" ")}
                  >
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${severityTone[notification.severity]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-medium text-slate-200">
                          {notification.title}
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                        )}
                      </div>

                      <div className="mt-1 text-[11px] leading-4 text-slate-400">
                        {notification.description}
                      </div>

                      <div className="mt-1.5 text-[10px] text-slate-500">
                        {relativeTime(notification.timestamp)}
                      </div>
                    </div>
                  </button>
                );
              })
          )}
        </div>

        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              className="flex w-full items-center justify-center px-3 py-2.5 text-[11px] font-semibold text-cyan-200 hover:bg-white/[0.03]"
              onClick={() => navigateSafely(navigate, "/activity")}
            >
              View all activity
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
