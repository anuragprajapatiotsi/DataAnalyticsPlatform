"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Empty,
  Badge,
  Popconfirm,
  Tooltip,
  message,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Role } from "../../types";
import type { Role as RolesRole } from "../../../roles/types";
import { ManagementSelectionModal } from "./ManagementSelectionModal";
import { teamService } from "../../services/team.service";
import { useRoles } from "../../../roles/hooks/useRoles";

interface TeamDetailsRolesProps {
  roles: Role[];
  isAdmin: boolean;
  onAssignRoles: (roleIds: string[]) => Promise<void>;
  onRemoveRole: (roleId: string) => void;
  isLoading?: boolean;
}

export function TeamDetailsRoles({
  roles,
  isAdmin,
  onAssignRoles,
  onRemoveRole,
  isLoading,
}: TeamDetailsRolesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all available roles for the selection modal
  const { roles: rolesData, isLoading: isLoadingAvailable } = useRoles({
    skip: 0,
    limit: 100,
  });
  const availableRoles = rolesData || [];

  // Filter out roles already assigned to the team
  const assignedRoleIds = new Set(roles.map((r) => r.id));
  const trulyAvailableRoles = availableRoles.filter(
    (r: RolesRole) => !assignedRoleIds.has(r.id),
  );

  const handleAssignSubmit = async (roleIds: string[]) => {
    try {
      await onAssignRoles(roleIds);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-slate-900 m-0">Roles</h2>
        {isAdmin && (
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-lg font-bold shadow-lg flex items-center gap-2 transform transition-transform active:scale-95"
          >
            Add Role
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Role Name
              </TableHead>
              <TableHead className="text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Description
              </TableHead>
              <TableHead className="text-right text-[13px] font-bold text-slate-500 uppercase py-3 px-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span>Fetching roles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-bold text-lg">
                          No roles assigned
                        </span>
                        <span className="text-slate-400 text-[14px] font-medium">
                          Assign roles to define what this team can do.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="group hover:bg-slate-50/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/settings/access-control/roles/${role.id}`}
                        className="text-blue-600 hover:text-blue-700 text-[14px] font-medium transition-colors"
                      >
                        {role.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-500 text-[14px] font-medium">
                    {role.description || "No description provided."}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "view",
                            label: "View Permissions",
                            icon: <ChevronRight className="h-4 w-4" />,
                          },
                          isAdmin && {
                            key: "remove",
                            label: (
                              <Popconfirm
                                title="Remove Role"
                                description="Are you sure you want to remove this role?"
                                onConfirm={() => onRemoveRole(role.id)}
                                okType="danger"
                                okText="Remove"
                              >
                                <span className="text-red-500">Remove Role</span>
                              </Popconfirm>
                            ),
                            icon: <Trash2 className="h-4 w-4 text-red-500" />,
                          },
                        ].filter(Boolean) as MenuProps["items"],
                      }}
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        icon={<MoreVertical className="h-4 w-4 text-slate-400" />}
                      />
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ManagementSelectionModal
        title="Assign Roles to Team"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleAssignSubmit}
        items={trulyAvailableRoles}
        isLoading={isLoadingAvailable}
        placeholder="Search roles by name or description..."
        itemType="role"
      />
    </div>
  );
}
