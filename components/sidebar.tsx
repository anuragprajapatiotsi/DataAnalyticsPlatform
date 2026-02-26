"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Compass,
  GitBranch,
  Home,
  Lightbulb,
  LogOut,
  Radar,
  Settings,
  ShieldCheck,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useSidebar } from "@/context/sidebar-context";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore/data-assets", icon: Compass },
  { label: "Lineage", href: "/lineage", icon: GitBranch },
  { label: "Observability", href: "/observability/data-quality", icon: Radar },
  { label: "Insights", href: "/insights", icon: Lightbulb },
  { label: "Domains", href: "/domains", icon: Sparkles },
  { label: "Govern", href: "/govern", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const { logout, isLoggingOut } = useAuth();
  const [isObservabilityOpen, setIsObservabilityOpen] = useState(
    pathname.startsWith("/observability"),
  );

  // Flyout state for collapsed mode
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState<number>(0);
  const flyoutTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    if (!collapsed) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);

    // Calculate vertical position for fixed placement to bypass overflow-y-auto clipping
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutTop(rect.top);
    setHoveredItem(label);
  };

  const handleMouseLeave = () => {
    if (!collapsed) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150); // Small buffer to allow moving mouse to the flyout
  };

  useEffect(() => {
    if (pathname.startsWith("/observability") && !collapsed) {
      setIsObservabilityOpen(true);
    }
  }, [pathname, collapsed]);

  // Handle ESC key to close flyout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHoveredItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      className={cn(
        "hidden shrink-0 h-screen sticky top-0 overflow-y-auto custom-scrollbar border-r border-slate-200 bg-slate-100/90 py-6 transition-all duration-300 ease-in-out lg:flex lg:flex-col",
        collapsed ? "w-[72px] px-3" : "w-[260px] px-4",
      )}
    >
      <div
        className={cn(
          "mb-8 flex items-center gap-2 px-2",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Image
            src="/otsi-logo.png"
            alt="OTSI logo"
            width={32}
            height={32}
            className="rounded-lg object-contain shrink-0"
          />
          {!collapsed && (
            <div className="animate-in fade-in duration-300 whitespace-nowrap">
              <p className="text-sm font-semibold text-slate-900">OTSI</p>
              <p className="text-xs text-slate-500">Metadata Platform</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isObservability = item.label === "Observability";
          const isActive =
            pathname === item.href ||
            (isObservability && pathname.startsWith("/observability"));

          // Build the common link content
          const LinkContent = (
            <>
              <Icon
                className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isObservability && (
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isObservabilityOpen ? "rotate-180" : "rotate-0",
                      )}
                    />
                  )}
                </>
              )}
            </>
          );

          // The main action element (Link)
          const MainLink = (
            <Link
              href={item.href}
              onClick={() => {
                if (isObservability && !collapsed) {
                  setIsObservabilityOpen(!isObservabilityOpen);
                }
                if (collapsed) setHoveredItem(null);
              }}
              className={cn(
                "relative flex items-center gap-3 rounded-xl transition-all duration-200",
                collapsed
                  ? "h-11 w-11 justify-center p-0"
                  : "px-3 py-2 text-sm font-medium",
                isActive
                  ? collapsed
                    ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 rounded-l-none rounded-r-xl"
                    : "bg-white text-blue-700 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              {LinkContent}
            </Link>
          );

          return (
            <div
              key={item.label}
              className="relative space-y-1"
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {collapsed && !isObservability ? (
                <Tooltip content={item.label}>{MainLink}</Tooltip>
              ) : (
                MainLink
              )}

              {/* Flyout for collapsed mode (Rendered with fixed positioning to avoid sidebar clipping) */}
              {collapsed &&
                isObservability &&
                hoveredItem === "Observability" && (
                  <div
                    className="fixed left-[72px] z-[100] w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200"
                    style={{ top: flyoutTop }}
                  >
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Observability
                    </p>
                    <div className="mt-1 flex flex-col gap-1">
                      {[
                        {
                          label: "Data Quality",
                          href: "/observability/data-quality",
                        },
                        {
                          label: "Incident Manager",
                          href: "/observability/incidents",
                        },
                        { label: "Alerts", href: "/observability/alerts" },
                      ].map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          onClick={() => setHoveredItem(null)}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            pathname === subItem.href
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          )}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* Nested list for expanded mode */}
              {!collapsed && isObservability && isObservabilityOpen && (
                <div className="ml-9 flex flex-col gap-1 border-l border-slate-200/50 pl-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {[
                    {
                      label: "Data Quality",
                      href: "/observability/data-quality",
                    },
                    {
                      label: "Incident Manager",
                      href: "/observability/incidents",
                    },
                    { label: "Alerts", href: "/observability/alerts" },
                  ].map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        pathname === subItem.href
                          ? "text-blue-600 bg-blue-50/50"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/50",
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div
        className={cn("mt-4 flex flex-col", collapsed ? "items-center" : "")}
      >
        {collapsed ? (
          <Tooltip content="Logout">
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        )}
      </div>
    </aside>
  );
}
