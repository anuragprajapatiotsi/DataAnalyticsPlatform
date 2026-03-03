import React from "react";
import { Shield, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button, Popconfirm } from "antd";
import { Policy } from "../../types";
import { RolePolicySelectionModal } from "./RolePolicySelectionModal";

interface RolePoliciesTableProps {
  policies: Policy[];
  isLoading: boolean;
  allPolicies: Policy[];
  isLoadingAllPolicies: boolean;
  isPolicyModalOpen: boolean;
  setIsPolicyModalOpen: (open: boolean) => void;
  onAddPolicies: (policyIds: string[]) => Promise<void>;
  isAttaching: boolean;
  onDetachPolicy: (policyId: string) => Promise<void>;
  isDetaching: boolean;
}

export function RolePoliciesTable({
  policies,
  isLoading,
  allPolicies,
  isLoadingAllPolicies,
  isPolicyModalOpen,
  setIsPolicyModalOpen,
  onAddPolicies,
  isAttaching,
  onDetachPolicy,
  isDetaching,
}: RolePoliciesTableProps) {
  const assignedPolicyIds = policies.map((p) => p.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-bold text-slate-900 m-0">
            Attached Policies
          </h3>
          <p className="text-[13px] text-slate-500 font-medium m-0">
            Manage access rules assigned to this role.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700 h-10 px-5 rounded-lg font-bold shadow-sm"
          onClick={() => setIsPolicyModalOpen(true)}
        >
          Add Policy
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
                Policy Name
              </TableHead>
              <TableHead className="text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
                Description
              </TableHead>
              <TableHead className="text-right text-[12px] font-bold text-slate-500 uppercase py-4 px-8">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="font-medium">Loading policies...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !policies || policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Shield className="h-10 w-10 opacity-20" />
                    <span className="font-medium text-[14px]">
                      No policies attached
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow
                  key={policy.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <TableCell className="px-8 py-5">
                    <span className="font-bold text-slate-900 text-[14px]">
                      {policy.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <p className="text-[13.5px] text-slate-600 m-0 line-clamp-1 max-w-md font-medium">
                      {policy.description || "No description provided"}
                    </p>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Popconfirm
                      title="Remove Policy"
                      description="Are you sure you want to remove this policy from the role?"
                      onConfirm={() => onDetachPolicy(policy.id)}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true, loading: isDetaching }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 className="h-4 w-4" />}
                        className="hover:bg-red-50 rounded-lg flex items-center justify-center ml-auto"
                      />
                    </Popconfirm>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RolePolicySelectionModal
        open={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onAdd={onAddPolicies}
        allPolicies={allPolicies}
        alreadyAssignedPolicyIds={assignedPolicyIds}
        isLoading={isLoadingAllPolicies}
        isSubmitting={isAttaching}
      />
    </div>
  );
}
