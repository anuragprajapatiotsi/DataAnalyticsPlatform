"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Trash2,
  MinusCircle,
  ChevronRight,
  Eye,
  Edit2,
  Users as UsersIcon,
} from "lucide-react";
import { Button, Empty, Badge, Popconfirm, Tooltip, message } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Policy } from "../../types";
import { ManagementSelectionModal } from "./ManagementSelectionModal";
import { teamService } from "../../services/team.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface TeamDetailsPoliciesProps {
  policies: Policy[];
  isAdmin: boolean;
  onAttachPolicies: (policyIds: string[]) => Promise<void>;
  onDetachPolicy: (id: string) => void;
  isLoading?: boolean;
}

export function TeamDetailsPolicies({
  policies,
  isAdmin,
  onAttachPolicies,
  onDetachPolicy,
  isLoading,
}: TeamDetailsPoliciesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch available policies for the selection modal
  const { data: availablePolicies = [], isLoading: isLoadingAvailable } =
    useQuery({
      queryKey: ["policies"],
      queryFn: () => teamService.getAvailablePolicies(),
      enabled: isModalOpen,
    });

  // Filter out policies already attached
  const attachedPolicyIds = new Set(policies.map((p) => p.id));
  const trulyAvailablePolicies = availablePolicies.filter(
    (p) => !attachedPolicyIds.has(p.id),
  );

  const handleAttachSubmit = async (policyIds: string[]) => {
    try {
      await onAttachPolicies(policyIds);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-slate-900 m-0">Policies</h2>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-lg font-bold shadow-lg flex items-center gap-2 transform transition-transform active:scale-95"
          >
            Add Policy
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span>Fetching policies...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold text-lg">
                          No policies attached
                        </span>
                        <span className="text-slate-400 text-[14px] font-medium">
                          Attach policies to govern data access for this team.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id} className="group">
                  <TableCell className="px-6 py-4">
                    <Link
                      href={`/settings/access-control/policies/${policy.id}`}
                      className="text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors block w-fit"
                    >
                      {policy.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 text-[14px]">
                    {policy.description || "No description provided."}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <Popconfirm
                          title="Detach Policy"
                          description="Are you sure you want to detach this policy from the team?"
                          onConfirm={() => onDetachPolicy(policy.id)}
                          okType="danger"
                          okText="Detach"
                        >
                          <Button
                            type="text"
                            icon={
                              <MinusCircle
                                size={20}
                                className="text-slate-400 hover:text-red-500 transition-colors leading-none"
                              />
                            }
                            className="flex items-center justify-center hover:bg-slate-100 rounded-lg h-8 w-8 p-0 ml-auto"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ManagementSelectionModal
        title="Attach Policies to Team"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleAttachSubmit}
        items={trulyAvailablePolicies}
        isLoading={isLoadingAvailable}
        placeholder="Search policies by name or description..."
        itemType="policy"
      />
    </div>
  );
}
