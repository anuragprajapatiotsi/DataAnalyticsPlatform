"use client";

import React from "react";
import { Form, Input, Switch, Select, Button, message } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTeams } from "../hooks/useTeams";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { Team } from "../types";

interface CreateTeamFormProps {
  teams: Team[];
}

export function CreateTeamForm({ teams }: CreateTeamFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { createTeam, isCreating } = useTeams();
  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();

  const handleSubmit = async (values: any) => {
    try {
      await createTeam(values);
      message.success("Team created successfully");
      router.push("/settings/organization-team-user-management/teams");
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors = Object.entries(error.errors).map(
          ([name, messages]) => ({
            name,
            errors: Array.isArray(messages) ? messages : [String(messages)],
          })
        );
        form.setFields(fieldErrors);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      requiredMark={false}
      initialValues={{
        team_type: "group",
        is_active: true,
        public_team_view: false,
      }}
    >
      <div className="grid grid-cols-2 gap-x-4">

        {/* Organization */}
        <Form.Item
          name="org_id"
          label={<span className="font-semibold text-slate-700 text-sm">Organization</span>}
          rules={[{ required: true, message: "Please select an organization" }]}
          className="col-span-2 "
        >
          <Select
            placeholder="Select an organization"
            loading={isLoadingOrgs}
            className="w-full"
            size="middle"
            options={organizations.map((org: any) => ({
              label: org.name,
              value: org.id,
            }))}
          />
        </Form.Item>

        {/* Display Name */}
        <Form.Item
          name="display_name"
          label={<span className="font-semibold text-slate-700 text-sm">Display Name</span>}
          rules={[{ required: true, message: "Please enter display name" }]}
          className="mb-0"
        >
          <Input placeholder="Engineering" className="h-8 rounded-md" />
        </Form.Item>

        {/* Unique Name */}
        <Form.Item
          name="name"
          label={<span className="font-semibold text-slate-700 text-sm">Unique Name</span>}
          rules={[{ required: true, message: "Please enter unique name" }]}
          className="mb-2"
        >
          <Input placeholder="engineering" className="h-8 rounded-md" />
        </Form.Item>

        {/* Team Email */}
        <Form.Item
          name="email"
          label={<span className="font-semibold text-slate-700 text-sm">Team Email</span>}
          rules={[
            { required: true, message: "Please enter team email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
          className="mb-2"
        >
          <Input placeholder="team@example.com" className="h-8 rounded-md" />
        </Form.Item>

        {/* Team Type */}
        <Form.Item
          name="team_type"
          label={<span className="font-semibold text-slate-700 text-sm">Team Type</span>}
          rules={[{ required: true, message: "Please select team type" }]}
          className="mb-2"
        >
          <Select size="middle" className="w-full">
            <Select.Option value="group">Group</Select.Option>
            <Select.Option value="organization">Organization</Select.Option>
            <Select.Option value="department">Department</Select.Option>
            <Select.Option value="division">Division</Select.Option>
          </Select>
        </Form.Item>

        {/* Parent Team */}
        <Form.Item
          name="parent_team_id"
          label={<span className="font-semibold text-slate-700 text-sm">Parent Team</span>}
          className="col-span-2 mb-2"
        >
          <Select
            placeholder="Select parent team (optional)"
            allowClear
            size="middle"
          >
            {teams.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.display_name} ({t.name})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Domain */}
        <Form.Item
          name="domain_id"
          label={<span className="font-semibold text-slate-700 text-sm">Domain</span>}
          className="col-span-2 mb-2"
        >
          <Select
            placeholder="Select domain (optional)"
            allowClear
            size="middle"
            options={[
              { label: "Finance", value: "finance" },
              { label: "Marketing", value: "marketing" },
              { label: "Operations", value: "operations" },
              { label: "Data Platform", value: "data-platform" },
            ]}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label={<span className="font-semibold text-slate-700">Description</span>}
          className="col-span-2 mb-2"
        >
          <Input.TextArea
            placeholder="Team description"
            rows={2}
            className="rounded-md"
          />
        </Form.Item>

        {/* Switches */}
        <div className="col-span-2 flex gap-8 mt-2">
          <Form.Item
            name="public_team_view"
            label={<span className="font-semibold text-slate-700">Public View</span>}
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label={<span className="font-semibold text-slate-700">Active</span>}
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
        <Link href="/settings/organization-team-user-management/teams">
          <Button className="h-9 rounded-md px-5 font-semibold">
            Cancel
          </Button>
        </Link>

        <Button
          type="primary"
          htmlType="submit"
          loading={isCreating}
          className="h-9 rounded-md px-6 bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Create Team
        </Button>
      </div>
    </Form>
  );
}