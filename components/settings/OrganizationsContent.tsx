"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Mail,
  Calendar,
} from "lucide-react";
import { message, Popconfirm, Button } from "antd";

import { orgsApi } from "@/services/api/orgs";
import { OrgModal } from "@/components/settings/org-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function OrganizationsContent() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ["orgs"],
    queryFn: () => orgsApi.getOrgs(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgsApi.deleteOrg(id),
    onSuccess: () => {
      message.success("Organization deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Failed to delete organization",
      );
    },
  });

  const handleCreate = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEdit = (org: any) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const filteredOrgs = orgs.filter(
    (org) =>
      org.is_active &&
      (org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.contact_email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-slate-900 m-0">
            Organizations
          </h2>
          <p className="text-[14px] text-slate-500 m-0">
            View and manage organizational entities and their contact details.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 rounded-lg"
        >
          Add Organization
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[320px] h-10 pl-10 rounded-lg border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[250px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Organization
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Description
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Contact
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Status
              </TableHead>
              <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredOrgs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => (
                <TableRow
                  key={org.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-[14px]">
                          {org.name}
                        </span>
                        {org.is_default && (
                          <Badge variant="primary" className="text-[10px] py-0">
                            Default
                          </Badge>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-400">
                        {org.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-[14px] text-slate-500 max-w-[200px] line-clamp-2 leading-relaxed">
                      {org.description || "No description provided."}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[14px] font-medium">
                        {org.contact_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {org.is_active ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[12px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-rose-50 text-rose-700 border-rose-100 text-[12px]"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="text"
                        icon={<Edit2 className="h-4 w-4" />}
                        onClick={() => handleEdit(org)}
                        className="text-slate-400 hover:text-blue-600"
                      />
                      <Popconfirm
                        title="Delete Organization"
                        description="Are you sure?"
                        onConfirm={() => deleteMutation.mutate(org.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="h-4 w-4" />}
                          className="text-slate-400 hover:text-red-600"
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

      <OrgModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        org={editingOrg}
      />
    </div>
  );
}
