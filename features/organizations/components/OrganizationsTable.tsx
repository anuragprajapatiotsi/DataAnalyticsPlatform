"use client";

import React from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  MoreVertical,
} from "lucide-react";
import { Popconfirm, Button, Dropdown, MenuProps } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { Organization } from "@/shared/types";

interface OrganizationsTableProps {
  organizations: Organization[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  onEditClick: (org: Organization) => void;
  onDeleteConfirm: (id: string) => void;
  onRowClick?: (id: string) => void;
}

export function OrganizationsTable({
  organizations,
  isLoading,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteConfirm,
  onRowClick,
}: OrganizationsTableProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[320px] h-9 pl-10 rounded-lg border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-blue-500 text-[13px]"
          />
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-lg font-semibold shadow-sm flex items-center gap-2"
        >
          Add Organization
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Organization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Building2 className="h-8 w-8 text-slate-300" />
                    <span>No organizations found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow
                  key={org.id}
                  className="group cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => onRowClick?.(org.id)}
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-[14px]">
                          {org.name}
                        </span>
                        {org.is_default && (
                          <Badge
                            variant="primary"
                            className="text-[10px] py-0 px-1.5 h-4 flex items-center bg-blue-50 text-blue-600 border-blue-100"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-[14px] font-medium">
                        {org.contact_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          org.is_active ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span
                        className={
                          org.is_active ? "text-emerald-600" : "text-slate-500"
                        }
                      >
                        {org.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "edit",
                            label: "Edit Organization",
                            icon: <Edit2 size={14} />,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              onEditClick(org);
                            },
                          },
                          {
                            type: "divider",
                          },
                          {
                            key: "delete",
                            label: (
                              <Popconfirm
                                title="Delete Organization"
                                description="Are you sure you want to delete this organization?"
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  onDeleteConfirm(org.id);
                                }}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{
                                  danger: true,
                                  onClick: (e) => e.stopPropagation(),
                                }}
                                cancelButtonProps={{
                                  onClick: (e) => e.stopPropagation(),
                                }}
                              >
                                <span
                                  className="text-red-600 block w-full text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Delete Organization
                                </span>
                              </Popconfirm>
                            ),
                            icon: <Trash2 size={14} className="text-red-600" />,
                            danger: true,
                          },
                        ],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={
                          <MoreVertical size={16} className="text-slate-400" />
                        }
                        className="hover:bg-slate-100 rounded-lg h-8 w-8 flex items-center justify-center p-0 ml-auto"
                        onClick={(e) => e.stopPropagation()}
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
