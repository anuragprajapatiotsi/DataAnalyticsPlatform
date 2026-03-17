"use client";

import React, { useState, useEffect } from "react";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { TeamsTable } from "@/features/teams/components/TeamsTable";
import { TeamModal } from "@/features/teams/components/TeamModal";
import { useAuthContext } from "@/shared/contexts/auth-context";
import type { Team } from "@/features/teams/types";
import {
  TeamsTabs,
  type TeamManagementTab,
} from "@/features/teams/components/TeamsTabs";
import { RolesList } from "@/features/teams/components/RolesList";
import { PoliciesList } from "@/features/teams/components/PoliciesList";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Input, Button, Select, Switch } from "antd";
import { Search, Plus, Filter } from "lucide-react";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { GetTeamsParams } from "@/features/teams/types";

export default function TeamsPage() {
  const { user } = useAuthContext();
  const isAdmin = !!(user?.is_admin || user?.is_global_admin);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TeamManagementTab>(
    (searchParams.get("tab") as TeamManagementTab) || "teams",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [params, setParams] = useState<any>({
    skip: 0,
    limit: 5,
    search: "",
    team_type: undefined,
    org_id: undefined,
    domain_id: undefined,
    is_active: undefined,
    root_only: undefined,
  });

  // Handle Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev: any) => ({ ...prev, search: searchTerm, skip: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    teams,
    total,
    isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    isCreating,
    isUpdating,
  } = useTeams(params);

  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab") as TeamManagementTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TeamManagementTab) => {
    setActiveTab(tab);
    router.push(
      `/settings/organization-team-user-management/teams?tab=${tab}`,
      {
        scroll: false,
      },
    );
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setParams((prev: any) => ({
      ...prev,
      limit: pageSize,
      skip: (page - 1) * pageSize,
    }));
  };

  const handleParamChange = (key: string, value: any) => {
    setParams((prev: any) => ({ ...prev, [key]: value, skip: 0 }));
  };

  const currentPage = Math.floor(params.skip / params.limit) + 1;
  const isFiltered =
    params.search ||
    params.team_type ||
    params.org_id ||
    params.domain_id ||
    params.is_active !== undefined ||
    params.root_only !== undefined;

  const handleClearFilters = () => {
    setSearchTerm("");
    setParams({
      skip: 0,
      limit: 5,
      search: "",
      team_type: undefined,
      org_id: undefined,
      domain_id: undefined,
      is_active: undefined,
      root_only: undefined,
    });
  };

  const handleCreate = () => {
    router.push("/settings/organization-team-user-management/teams/create");
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingTeam) {
      await updateTeam({ id: editingTeam.id, data: values });
    } else {
      await createTeam(values);
    }
    setIsModalOpen(false);
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    { label: "Teams" },
  ];

  return (
    <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-500 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Teams"
          description="View and manage teams in your organization."
          breadcrumbItems={breadcrumbItems}
        />
        {activeTab === "teams" && isAdmin && (
          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 h-9 px-5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 mt-1 text-[13px]"
          >
            Add Team
          </Button>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <TeamsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isAdmin={isAdmin}
        />

        {activeTab === "teams" && (
          <div className="flex flex-col space-y-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-all overflow-x-auto">
            {/* Row 1: Search */}
            <div className="flex flex-row gap-2 items-center">
              <Input
                placeholder="Search teams..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 max-w-[550px] h-9 teams-search"
                size="middle"
                prefix={<Search size={14} className="text-slate-400 mr-1.5" />}
              />
              <div className="h-9 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 select-none">
                <span className="text-[12px] font-medium italic">
                  Typing...
                </span>
                {isLoading && (
                  <div className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="flex flex-row gap-2 items-center justify-between">
              <div className="flex flex-row gap-2 items-center flex-1 min-w-0">
                <Select
                  placeholder="Team Type"
                  allowClear
                  className="w-[140px] h-9 flex-shrink-0"
                  onChange={(val) => handleParamChange("team_type", val)}
                  value={params.team_type}
                  size="middle"
                >
                  <Select.Option value="business_unit">
                    Business Unit
                  </Select.Option>
                  <Select.Option value="division">Division</Select.Option>
                  <Select.Option value="department">Department</Select.Option>
                  <Select.Option value="group">Group</Select.Option>
                </Select>

                <Select
                  placeholder="Organization"
                  allowClear
                  className="w-[180px] h-9 flex-shrink-0"
                  onChange={(val) => handleParamChange("org_id", val)}
                  value={params.org_id}
                  loading={isLoadingOrgs}
                  size="middle"
                  options={organizations.map((org: any) => ({
                    label: org.name,
                    value: org.id,
                  }))}
                />

                <Select
                  placeholder="Domain"
                  allowClear
                  className="w-[160px] h-9 flex-shrink-0"
                  onChange={(val) => handleParamChange("domain_id", val)}
                  value={params.domain_id}
                  size="middle"
                  options={[
                    { label: "Finance", value: "finance" },
                    { label: "Marketing", value: "marketing" },
                    { label: "Operations", value: "operations" },
                    { label: "Data Platform", value: "data-platform" },
                  ]}
                />

                <Select
                  placeholder="Status"
                  allowClear
                  className="w-[120px] h-9 flex-shrink-0"
                  onChange={(val) => handleParamChange("is_active", val)}
                  value={params.is_active}
                  size="middle"
                >
                  <Select.Option value={true}>Active</Select.Option>
                  <Select.Option value={false}>Inactive</Select.Option>
                </Select>

                <div className="flex items-center gap-1.5 px-2 h-9 bg-slate-50 rounded-lg border border-slate-200 flex-shrink-0">
                  <span className="text-[12px] text-slate-600 font-medium">
                    Root Only
                  </span>
                  <Switch
                    size="small"
                    checked={params.root_only}
                    onChange={(checked) =>
                      handleParamChange("root_only", checked || undefined)
                    }
                  />
                </div>

                {isFiltered && (
                  <Button
                    type="text"
                    onClick={handleClearFilters}
                    className="text-slate-500 hover:text-blue-600 font-semibold text-[12.5px] px-1.5 h-8 flex items-center flex-shrink-0"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-100 shadow-sm flex-shrink-0">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-tight">
                  Total Teams:
                </span>
                <span className="text-[12px] text-slate-900 font-bold leading-none">
                  {total || teams.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-y-auto">
        {activeTab === "teams" && (
          <TeamsTable
            teams={teams}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onEditClick={handleEdit}
            onDeleteConfirm={deleteTeam}
            total={total}
            current={currentPage}
            pageSize={params.limit}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === "roles" && <RolesList />}

        {activeTab === "policies" && <PoliciesList />}
      </div>

      <TeamModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingTeam}
        isLoading={isCreating || isUpdating}
        teams={teams}
      />

      <style jsx global>{`
        .teams-search .ant-input-affix-wrapper {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          padding-left: 10px !important;
          height: 36px !important;
          font-size: 13px !important;
        }
        .teams-search .ant-input-affix-wrapper:hover,
        .teams-search .ant-input-affix-wrapper:focus {
          border-color: #2563eb !important;
        }
        .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
          height: 36px !important;
          font-size: 13px !important;
          padding: 0 10px !important;
        }
        .ant-select-selection-item {
          line-height: 34px !important;
        }
        .ant-select-selection-placeholder {
          line-height: 34px !important;
        }
      `}</style>
    </div>
  );
}
