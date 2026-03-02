"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useSidebar } from "@/context/sidebar-context";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useNavigation } from "@/context/navigation-context";
import { getIcon } from "@/utils/icon-mapper";
import type { NavItem } from "@/services/api/types";

// Recursive Sidebar Item Component
interface SidebarItemProps {
  item: NavItem;
  level: number;
  collapsed: boolean;
  pathname: string;
  expandedMenus: Record<string, boolean>;
  toggleMenu: (slug: string) => void;
  onMouseEnter: (e: React.MouseEvent, item: NavItem) => void;
  onMouseLeave: () => void;
}

function SidebarItem({
  item,
  level,
  collapsed,
  pathname,
  expandedMenus,
  toggleMenu,
  onMouseEnter,
  onMouseLeave,
}: SidebarItemProps) {
  const router = useRouter();
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = !!expandedMenus[item.slug];

  // Recursively check if this item or any of its children are active
  const isRouteActive = (navItem: NavItem): boolean => {
    if (navItem.nav_url && pathname === navItem.nav_url) return true;
    if (navItem.children) {
      return navItem.children.some((child) => isRouteActive(child));
    }
    return false;
  };

  const isActive = isRouteActive(item);
  const Icon = getIcon(item.icon);

  const content = (
    <Link
      href={item.nav_url || "#"}
      onClick={(e) => {
        if (hasChildren && !collapsed) {
          toggleMenu(item.slug);
          if (!item.nav_url) {
            e.preventDefault();
          }
        }
      }}
      onMouseEnter={(e) => onMouseEnter(e, item)}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer",
        collapsed
          ? "h-11 w-11 justify-center p-0"
          : cn(
              level === 0 ? "px-3 py-2 text-sm" : "px-3 py-1.5 text-xs",
              "font-medium",
            ),
        isActive
          ? collapsed
            ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 rounded-l-none rounded-r-xl"
            : level === 0
              ? "bg-white text-blue-700 shadow-sm border border-slate-200/50"
              : "text-blue-600 bg-blue-50/50"
          : "text-slate-600 hover:bg-white hover:text-slate-900",
        level > 0 && !collapsed && "ml-4",
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.display_name}</span>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isExpanded ? "rotate-180" : "rotate-0",
              )}
            />
          )}
        </>
      )}
    </Link>
  );

  return (
    <div className="space-y-1">
      {collapsed ? (
        <Tooltip content={item.display_name}>{content}</Tooltip>
      ) : (
        content
      )}

      {hasChildren && !collapsed && isExpanded && (
        <div className="mt-1 flex flex-col gap-1 border-l border-slate-200/50 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              collapsed={collapsed}
              pathname={pathname}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleSidebar } = useSidebar();
  const { logout, isLoggingOut } = useAuth();
  const { navItems, isLoading, isError } = useNavigation();
  const SettingsIcon = getIcon("settings");

  // State for expanded menus (map of slug -> boolean)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  // Flyout state for collapsed mode
  const [hoveredItem, setHoveredItem] = useState<NavItem | null>(null);
  const [flyoutTop, setFlyoutTop] = useState<number>(0);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, item: NavItem) => {
    if (!collapsed) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutTop(rect.top);
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    if (!collapsed) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  };

  // Initialize expanded menus based on current pathname
  useEffect(() => {
    if (collapsed) return;

    const findActivePaths = (items: NavItem[]): string[] => {
      for (const item of items) {
        if (item.nav_url === pathname) return [item.slug];
        if (item.children) {
          const childActivePath = findActivePaths(item.children);
          if (childActivePath.length > 0) {
            return [item.slug, ...childActivePath];
          }
        }
      }
      return [];
    };

    const activeSlugs = findActivePaths(navItems);
    if (activeSlugs.length > 0) {
      setExpandedMenus((prev) => {
        const next = { ...prev };
        activeSlugs.forEach((slug) => {
          next[slug] = true;
        });
        return next;
      });
    }
  }, [pathname, collapsed, navItems]);

  const toggleMenu = (slug: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const sortedNavItems = [...navItems].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
  );

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-slate-200 bg-slate-100/90 py-6 transition-all duration-300 ease-in-out lg:flex lg:flex-col",
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
            width={60}
            height={60}
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
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-slate-200"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="px-3 py-2 text-xs text-red-500 text-center">
            Failed to load navigation
          </div>
        ) : (
          sortedNavItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              level={0}
              collapsed={collapsed}
              pathname={pathname}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          ))
        )}
      </nav>

      {/* Flyout for collapsed mode */}
      {collapsed &&
        hoveredItem &&
        hoveredItem.children &&
        hoveredItem.children.length > 0 && (
          <div
            onMouseEnter={() => {
              if (flyoutTimeoutRef.current)
                clearTimeout(flyoutTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="fixed left-[72px] z-[100] w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200"
            style={{ top: flyoutTop }}
          >
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {hoveredItem.display_name}
            </p>
            <div className="mt-1 flex flex-col gap-1">
              {hoveredItem.children.map((subItem) => (
                <Link
                  key={subItem.id}
                  href={subItem.nav_url || "#"}
                  onClick={() => setHoveredItem(null)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === subItem.nav_url
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  {subItem.display_name}
                </Link>
              ))}
            </div>
          </div>
        )}

      <div
        className={cn(
          "mt-4 flex flex-col gap-1",
          collapsed ? "items-center" : "",
        )}
      >
        {collapsed ? (
          <Tooltip content="Settings">
            <Link
              href="/settings"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                pathname.startsWith("/settings")
                  ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 rounded-l-none rounded-r-xl"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              <SettingsIcon
                className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")}
              />
            </Link>
          </Tooltip>
        ) : (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
              pathname.startsWith("/settings")
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:bg-white hover:text-slate-900",
            )}
          >
            <SettingsIcon
              className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")}
            />
            <span>Settings</span>
          </Link>
        )}

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
