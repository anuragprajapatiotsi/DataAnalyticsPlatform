"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Bot, ChevronRight, RefreshCw, Workflow } from "lucide-react";

import { useNotificationFeed } from "@/features/notifications/hooks/useNotificationFeed";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";
import {
  formatNotificationTimestamp,
  getNotificationStatusTone,
  mapBotNotification,
  mapSyncNotification,
  sortNotificationsByNewest,
  type NotificationListItem,
} from "@/features/notifications/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

function NotificationSection({
  items,
  icon: Icon,
}: {
  items: NotificationListItem[];
  icon: typeof Workflow;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <Icon className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No notifications yet</p>
        <p className="text-xs text-slate-500">
          New activity for this tab will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={`${item.category}-${item.id}`}
          className="rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

                <Badge
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                    getNotificationStatusTone(item.status),
                  )}
                >
                  {item.status}
                </Badge>
              </div>

              <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                {item.message}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                {formatNotificationTimestamp(item.timestamp)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationMenu() {
  const [activeTab, setActiveTab] = useState<"sync" | "bot_runs">("sync");
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotificationFeed(10);

  const items = sortNotificationsByNewest([
    ...(data?.sync ?? []).map(mapSyncNotification),
    ...(data?.bots ?? []).map(mapBotNotification),
  ]).slice(0, 10);

  const syncItems = items.filter((item) => item.category === "sync");
  const botItems = items.filter((item) => item.category === "bot_runs");

  const totalCount = items.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {totalCount > 9 ? "9+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] rounded-xl border-slate-200 p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">
              Latest sync and bot activity
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Refresh notifications"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-lg border border-slate-100 p-3"
                >
                  <div className="mb-2 h-4 w-1/2 rounded bg-slate-100" />
                  <div className="mb-2 h-3 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <Bell className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                Unable to load notifications
              </p>
              <p className="text-xs text-slate-500">
                Please try refreshing in a moment.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <Bell className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                No notifications yet
              </p>
              <p className="text-xs text-slate-500">
                Sync and bot activity will appear here.
              </p>
            </div>
          ) : (
            <Tabs className="space-y-3">
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
                <TabsTrigger
                  active={activeTab === "sync"}
                  onClick={() => setActiveTab("sync")}
                  className="gap-2 rounded-md text-xs font-semibold"
                >
                  <Workflow className="h-4 w-4" />
                  Sync
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {syncItems.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  active={activeTab === "bot_runs"}
                  onClick={() => setActiveTab("bot_runs")}
                  className="gap-2 rounded-md text-xs font-semibold"
                >
                  <Bot className="h-4 w-4" />
                  Bot Runs
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {botItems.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sync" activeValue={activeTab} className="mt-0">
                <NotificationSection items={syncItems} icon={Workflow} />
              </TabsContent>
              <TabsContent
                value="bot_runs"
                activeValue={activeTab}
                className="mt-0"
              >
                <NotificationSection items={botItems} icon={Bot} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="border-t border-slate-100 p-2">
          <DropdownMenuItem asChild className="rounded-lg p-0 hover:bg-transparent">
            <Link
              href="/notifications"
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <span>Show more</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
