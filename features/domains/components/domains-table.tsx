"use client";

import { Button, Dropdown, Popconfirm, Tag, Tooltip } from "antd";
import {
  Edit2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import type { CatalogDomain } from "../types";

interface DomainsTableProps {
  domains: CatalogDomain[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onEditClick: (domain: CatalogDomain) => void;
  onDeleteConfirm: (id: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function renderPeople(value: CatalogDomain["owners"] | CatalogDomain["experts"]) {
  if (!value?.length) {
    return <span className="text-xs text-slate-400">None assigned</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {value.slice(0, 3).map((person) => (
        <Tag key={person.id} className="rounded-full px-2 py-0.5 text-xs">
          {person.display_name || person.name || person.email || person.id}
        </Tag>
      ))}
      {value.length > 3 ? (
        <Tag className="rounded-full px-2 py-0.5 text-xs">
          +{value.length - 3} more
        </Tag>
      ) : null}
    </div>
  );
}

export function DomainsTable({
  domains,
  isLoading,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteConfirm,
  onRefresh,
  isRefreshing,
}: DomainsTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search domains by name, type, owner, or description..."
            className="h-10 w-[360px] rounded-lg border-slate-200 pl-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Refresh domains">
            <Button
              onClick={onRefresh}
              icon={
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : undefined}
                />
              }
              className="h-10 rounded-lg border-slate-200"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={onCreateClick}
            className="h-10 rounded-lg bg-blue-600 px-4 font-semibold hover:!bg-blue-700"
          >
            Add Domain
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[240px]">Domain</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Owners</TableHead>
              <TableHead>Experts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  Loading domains...
                </TableCell>
              </TableRow>
            ) : domains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  No domains found.
                </TableCell>
              </TableRow>
            ) : (
              domains.map((domain) => (
                <TableRow key={domain.id} className="hover:bg-slate-50/70">
                  <TableCell className="py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border"
                        style={{
                          backgroundColor: `${domain.color || "#2563eb"}15`,
                          borderColor: `${domain.color || "#2563eb"}30`,
                          color: domain.color || "#2563eb",
                        }}
                      >
                        <span className="text-xs font-bold uppercase">
                          {(domain.display_name || domain.name || "D")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                          {domain.display_name || domain.name}
                        </div>
                        <div className="text-xs text-slate-500">{domain.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Tag className="rounded-full px-2 py-0.5 text-xs capitalize">
                      {domain.domain_type || "Unspecified"}
                    </Tag>
                  </TableCell>
                  <TableCell className="max-w-[320px] py-4 text-sm text-slate-600">
                    {domain.description || "No description provided."}
                  </TableCell>
                  <TableCell className="py-4">{renderPeople(domain.owners)}</TableCell>
                  <TableCell className="py-4">{renderPeople(domain.experts)}</TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        domain.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {domain.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Dropdown
                      trigger={["click"]}
                      menu={{
                        items: [
                          {
                            key: "edit",
                            label: "Edit domain",
                            icon: <Edit2 size={14} />,
                            onClick: () => onEditClick(domain),
                          },
                          {
                            key: "delete",
                            danger: true,
                            icon: <Trash2 size={14} />,
                            label: (
                              <Popconfirm
                                title="Delete domain"
                                description="This domain will be removed permanently."
                                okText="Delete"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => onDeleteConfirm(domain.id)}
                              >
                                <span>Delete domain</span>
                              </Popconfirm>
                            ),
                          },
                        ],
                      }}
                    >
                      <Button
                        icon={<MoreVertical size={16} />}
                        className="h-8 w-8 rounded-lg border-none shadow-none"
                      />
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
