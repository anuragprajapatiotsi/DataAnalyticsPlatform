"use client";

import React from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mail,
  Building2,
} from "lucide-react";
import { Popconfirm, Button } from "antd";
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
}

export function OrganizationsTable({
  organizations,
  isLoading,
  searchQuery,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onDeleteConfirm,
}: OrganizationsTableProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-slate-900 m-0 leading-tight">
            Organizations
          </h2>
          <p className="text-[13px] text-slate-500 font-medium m-0">
            View and manage organizational entities and their contact details.
          </p>
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
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[220px] text-[13px] font-semibold text-slate-600 py-2 px-4">
                Organization
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Description
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Contact
              </TableHead>
              <TableHead className="text-[13px] font-semibold text-slate-600 py-2 px-4">
                Status
              </TableHead>
              <TableHead className="text-right text-[13px] font-semibold text-slate-600 py-2 px-4">
                Actions
              </TableHead>
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
                  className="hover:bg-slate-50/50 transition-colors group h-12"
                >
                  <TableCell className="px-4 py-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-[13px]">
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
                      <span className="text-[11px] text-slate-400 font-medium">
                        {org.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <p className="text-[13px] text-slate-500 max-w-[200px] line-clamp-1 leading-relaxed font-medium m-0">
                      {org.description || "No description provided."}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-[13px] font-medium">
                        {org.contact_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {org.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-semibold py-0 px-2 h-5 flex items-center w-fit">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700 border-rose-100 text-[11px] font-semibold py-0 px-2 h-5 flex items-center w-fit"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="text"
                        icon={<Edit2 size={16} />}
                        onClick={() => onEditClick(org)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 flex items-center justify-center rounded-lg"
                      />
                      <Popconfirm
                        title="Delete Organization"
                        description="Are you sure you want to delete this organization?"
                        onConfirm={() => onDeleteConfirm(org.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={16} />}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex items-center justify-center rounded-lg"
                        />
                      </Popconfirm>
                    </div>
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
