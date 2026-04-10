"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Popconfirm,
  Select,
  Switch,
  Tooltip,
} from "antd";
import {
  Copy,
  Plus,
  Info,
  PenSquare,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { useDomains } from "@/features/domains/hooks/useDomains";
import { useAdminUsers } from "@/features/users/hooks/useAdminUsers";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { cn } from "@/shared/utils/cn";

import { ClassificationModal } from "./classification-modal";
import { ClassificationTagModal } from "./classification-tag-modal";
import { useClassificationDetail } from "../hooks/useClassificationDetail";
import { useClassifications } from "../hooks/useClassifications";
import type { Classification } from "../types";

type FilterState = {
  search?: string;
  is_active?: boolean;
  mutually_exclusive?: boolean;
  owner_id?: string;
  catalog_domain_id?: string;
};

function getOwnerLabel(owner: Classification["owners"][number]) {
  return owner.display_name || owner.name || owner.email || owner.id;
}

export function ClassificationsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const {
    data: classifications = [],
    isLoading,
    createClassification,
    isCreatingClassification,
  } = useClassifications({
    ...filters,
    skip: 0,
    limit: 50,
  });
  const { domains } = useDomains();
  const { data: users = [] } = useAdminUsers({ skip: 0, limit: 200 });

  const effectiveSelectedId =
    selectedId && classifications.some((item) => item.id === selectedId)
      ? selectedId
      : (classifications[0]?.id ?? null);

  const {
    classification: selectedClassification,
    tags,
    isLoadingDetail,
    isFetchingDetail,
    isLoadingTags,
    isFetchingTags,
    refetchDetail,
    refetchTags,
    updateClassification,
    deleteClassification,
    createTag,
    updateTag,
    deleteTag,
    isUpdatingClassification,
    isDeletingClassification,
    isCreatingTag,
    isUpdatingTag,
    isDeletingTag,
  } = useClassificationDetail(effectiveSelectedId);

  const classificationRows = tags;
  const editingTag =
    classificationRows.find((tag) => tag.id === editingTagId) ?? null;

  const toDetectionPatterns = (patterns: string[]) =>
    patterns.map((pattern) => ({
      type: "string",
      pattern,
      confidence: 1,
    }));

  const buildTagPayload = (
    tag: (typeof classificationRows)[number],
    overrides?: Partial<{ auto_classify: boolean; is_active: boolean }>,
  ) => ({
    name: tag.name,
    display_name: tag.display_name,
    description: tag.description,
    icon_url: tag.icon_url,
    color: tag.color,
    detection_patterns: tag.detection_patterns,
    auto_classify: overrides?.auto_classify ?? tag.auto_classify,
    owner_ids: tag.owners?.map((owner) => owner.id) ?? [],
    domain_ids: tag.domains?.map((domain) => domain.id) ?? [],
    is_active: overrides?.is_active ?? tag.is_active,
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/" },
    { label: "Govern" },
    { label: "Classifications" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f5f7fb] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <PageHeader
        title="Classifications"
        description="Review governance classifications, linked domains, and ownership in one place."
        breadcrumbItems={breadcrumbItems}
      />

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Classifications
                </h2>
                <Info className="h-4 w-4 text-blue-500" />
              </div>
              <Button
                type="primary"
                icon={<Plus size={14} />}
                className="h-9 rounded-lg bg-blue-600 px-4 hover:!bg-blue-700"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Add
              </Button>
            </div>
          </div>

          {/* <div className="grid gap-3 border-b border-slate-100 p-4">
            <Select
              allowClear
              showSearch
              placeholder="Search classifications"
              value={filters.search || undefined}
              onChange={(value) =>
                setFilters((current) => ({ ...current, search: value }))
              }
              options={classifications.map((item) => ({
                label: item.display_name || item.name,
                value: item.name,
              }))}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Select
                allowClear
                placeholder="Status"
                value={filters.is_active}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    is_active: value,
                  }))
                }
                options={[
                  { label: "Active", value: true },
                  { label: "Inactive", value: false },
                ]}
              />
              <Select
                allowClear
                placeholder="Exclusive"
                value={filters.mutually_exclusive}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    mutually_exclusive: value,
                  }))
                }
                options={[
                  { label: "Exclusive", value: true },
                  { label: "Shared", value: false },
                ]}
              />
            </div>
            <Select
              allowClear
              showSearch
              placeholder="Filter by owner"
              value={filters.owner_id}
              onChange={(value) =>
                setFilters((current) => ({ ...current, owner_id: value }))
              }
              options={ownerOptions}
              optionFilterProp="label"
            />
            <Select
              allowClear
              showSearch
              placeholder="Filter by domain"
              value={filters.catalog_domain_id}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  catalog_domain_id: value,
                }))
              }
              options={domainOptions}
              optionFilterProp="label"
            />
          </div> */}
          <div className="grid gap-3 border-b border-slate-100 p-4">
            <Select
              allowClear
              showSearch
              placeholder="Search classifications"
              value={filters.search || undefined}
              onChange={(value) =>
                setFilters((current) => ({ ...current, search: value }))
              }
              options={classifications.map((item) => ({
                label: item.display_name || item.name,
                value: item.name,
              }))}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading classifications...
              </div>
            ) : classifications.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4">
                <Empty description="No classifications found" />
              </div>
            ) : (
              <div className="space-y-1">
                {classifications.map((classification) => {
                  const isActive = classification.id === effectiveSelectedId;
                  return (
                    <button
                      key={classification.id}
                      onClick={() => setSelectedId(classification.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-all",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <span className="truncate text-sm font-medium">
                        {classification.display_name || classification.name}
                      </span>
                      <span
                        className={cn(
                          "ml-3 rounded-md px-2 py-0.5 text-xs font-semibold",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {classification.domains.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
          {isLoadingDetail ? (
            <div className="flex min-h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
              Loading classification details...
            </div>
          ) : selectedClassification ? (
            <div className="flex min-h-full flex-col gap-4 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl">
                      {selectedClassification.display_name ||
                        selectedClassification.name}
                    </h1>
                    <button
                      className="rounded-md border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <Popconfirm
                      title="Delete classification"
                      description="This classification will be removed permanently."
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{
                        danger: true,
                        loading: isDeletingClassification,
                      }}
                      onConfirm={async () => {
                        await deleteClassification(selectedClassification.id);
                        setSelectedId(null);
                      }}
                    >
                      <button className="rounded-md border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-white hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Popconfirm>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{selectedClassification.name}</span>
                    <Tooltip title="Copied name">
                      <button
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            selectedClassification.name,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
                <div className="flex min-h-0 min-w-0 flex-col gap-3">
                  <section className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="text-sm font-medium text-slate-700">
                        Classification Tags
                      </div>
                      <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        className="h-9 w-full rounded-lg bg-blue-600 px-4 hover:!bg-blue-700 sm:w-auto"
                        onClick={() => setIsTagModalOpen(true)}
                      >
                        Add Tag
                      </Button>
                    </div>
                    <div className="min-w-0 overflow-x-auto">
                      {isLoadingTags ? (
                        <div className="flex h-40 items-center justify-center px-6 text-sm text-slate-500">
                          Loading tags...
                        </div>
                      ) : classificationRows.length > 0 ? (
                        <div className="lg:min-w-[900px]">
                          <div className="hidden grid-cols-[110px_0.9fr_0.9fr_1.3fr_110px_96px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 lg:grid">
                            <span>Enabled</span>
                            <span>Tag</span>
                            <span>Display Name</span>
                            <span>Description</span>
                            <span>Auto Classify</span>
                            <span>Actions</span>
                          </div>
                          {classificationRows.map((tag) => (
                            <div
                              key={tag.id}
                              className="border-b border-slate-100 px-4 py-3"
                            >
                              <div className="grid items-start gap-3 lg:grid-cols-[110px_0.9fr_0.9fr_1.3fr_110px_96px] lg:text-sm">
                                <div className="flex items-center justify-between lg:block">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Enabled
                                  </span>
                                  <Switch
                                    checked={tag.is_active ?? true}
                                    loading={isUpdatingTag}
                                    onChange={(checked) => {
                                      if (!selectedClassification) {
                                        return;
                                      }
                                      void updateTag({
                                        classificationId:
                                          selectedClassification.id,
                                        tagId: tag.id,
                                        payload: buildTagPayload(tag, {
                                          is_active: checked,
                                        }),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="pr-4">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Tag
                                  </span>
                                  <div className="break-words text-sm text-blue-600">
                                    {tag.name}
                                  </div>
                                </div>
                                <div className="pr-4">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Display Name
                                  </span>
                                  <div className="break-words text-sm text-slate-900">
                                    {tag.display_name || tag.name}
                                  </div>
                                </div>
                                <div className="pr-4">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Description
                                  </span>
                                  <div className="break-words text-sm text-slate-700">
                                    {tag.description ||
                                      "No description provided."}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Auto Classify
                                  </span>
                                  <Switch
                                    checked={tag.auto_classify}
                                    loading={isUpdatingTag}
                                    onChange={(checked) => {
                                      if (!selectedClassification) {
                                        return;
                                      }
                                      void updateTag({
                                        classificationId:
                                          selectedClassification.id,
                                        tagId: tag.id,
                                        payload: buildTagPayload(tag, {
                                          auto_classify: checked,
                                        }),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
                                    Actions
                                  </span>
                                  <button
                                    className="rounded-md p-1 hover:bg-slate-100 hover:text-slate-700"
                                    onClick={() => {
                                      setEditingTagId(tag.id);
                                      setIsTagModalOpen(true);
                                    }}
                                  >
                                    <PenSquare className="h-4 w-4" />
                                  </button>
                                  <Popconfirm
                                    title="Delete tag"
                                    description="This tag will be removed permanently."
                                    okText="Delete"
                                    cancelText="Cancel"
                                    okButtonProps={{
                                      danger: true,
                                      loading: isDeletingTag,
                                    }}
                                    onConfirm={() => {
                                      if (!selectedClassification) {
                                        return;
                                      }
                                      return deleteTag({
                                        classificationId:
                                          selectedClassification.id,
                                        tagId: tag.id,
                                      });
                                    }}
                                  >
                                    <button className="rounded-md p-1 hover:bg-slate-100 hover:text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </Popconfirm>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center px-6 text-sm text-slate-500">
                          No tags found for this classification
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:flex xl:flex-col xl:self-start">
                  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Description
                      </h3>
                      <Button
                        type="default"
                        className="h-9 rounded-lg px-4"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm leading-7 text-slate-700">
                      {selectedClassification.description ||
                        "No description available."}
                    </p>
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Domains
                      </h3>
                      <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                    {selectedClassification.domains.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClassification.domains.map((domain) => (
                          <div
                            key={domain.id}
                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                          >
                            {domain.display_name || domain.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No Domains</p>
                    )}
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Owners
                      </h3>
                      <button className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50">
                        <Users className="h-4 w-4" />
                      </button>
                    </div>
                    {selectedClassification.owners.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedClassification.owners.map((owner) => (
                          <Tooltip key={owner.id} title={getOwnerLabel(owner)}>
                            <Avatar className="bg-violet-100 font-semibold text-violet-700">
                              {getOwnerLabel(owner).charAt(0).toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No Owners</p>
                    )}
                  </section>

                  <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">
                        Classification State
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          selectedClassification.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {selectedClassification.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">
                        Mutually Exclusive
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          selectedClassification.mutually_exclusive
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {selectedClassification.mutually_exclusive
                          ? "Exclusive"
                          : "Shared"}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="default"
                        block
                        className="h-9 rounded-lg"
                        onClick={() => {
                          void refetchDetail();
                          void refetchTags();
                        }}
                      >
                        {isFetchingDetail || isFetchingTags
                          ? "Refreshing..."
                          : "Refresh"}
                      </Button>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
              <Empty description="Select a classification to view details" />
            </div>
          )}
        </div>
      </div>

      <ClassificationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        domains={domains}
        isLoading={isCreatingClassification}
        onSubmit={async (values) => {
          await createClassification({
            name: values.name,
            display_name: values.display_name,
            description: values.description,
            mutually_exclusive: values.mutually_exclusive,
            owner_ids: values.owner_ids ?? [],
            domain_ids: values.domain_ids ?? [],
          });
          setIsCreateModalOpen(false);
        }}
      />

      <ClassificationModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialValues={selectedClassification}
        users={users}
        domains={domains}
        isLoading={isUpdatingClassification}
        onSubmit={async (values) => {
          if (!selectedClassification) {
            return;
          }

          await updateClassification({
            id: selectedClassification.id,
            payload: {
              ...values,
              is_active: values.is_active ?? true,
            },
          });
          setIsEditModalOpen(false);
        }}
      />

      <ClassificationTagModal
        open={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setEditingTagId(null);
        }}
        users={users}
        domains={domains}
        isLoading={isCreatingTag || isUpdatingTag}
        initialValues={editingTag}
        onSubmit={async (values) => {
          if (!selectedClassification) {
            return;
          }

          if (editingTag) {
            await updateTag({
              classificationId: selectedClassification.id,
              tagId: editingTag.id,
              payload: {
                name: values.name,
                display_name: values.display_name,
                description: values.description,
                icon_url: values.icon_url,
                color: values.color,
                detection_patterns: toDetectionPatterns(
                  values.detection_patterns,
                ),
                auto_classify: values.auto_classify,
                owner_ids: values.owner_ids ?? [],
                domain_ids: values.domain_ids ?? [],
                is_active: values.is_active ?? true,
              },
            });
          } else {
            await createTag({
              id: selectedClassification.id,
              payload: {
                name: values.name,
                display_name: values.display_name,
                description: values.description,
                icon_url: values.icon_url,
                color: values.color,
                detection_patterns: toDetectionPatterns(
                  values.detection_patterns,
                ),
                auto_classify: values.auto_classify,
                owner_ids: values.owner_ids ?? [],
                domain_ids: values.domain_ids ?? [],
              },
            });
          }
          setIsTagModalOpen(false);
          setEditingTagId(null);
        }}
      />
    </div>
  );
}
