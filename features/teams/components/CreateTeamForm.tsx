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
      // Map API validation errors to form fields
      if (error.errors) {
        const fieldErrors = Object.entries(error.errors).map(
          ([name, messages]) => ({
            name,
            errors: Array.isArray(messages) ? messages : [String(messages)],
          }),
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
      <div className="grid grid-cols-2 gap-6">
        <Form.Item
          name="org_id"
          label={
            <span className="font-semibold text-slate-700">Organization</span>
          }
          rules={[{ required: true, message: "Please select an organization" }]}
          className="col-span-2"
        >
          <Select
            placeholder="Select an organization"
            loading={isLoadingOrgs}
            size="large"
            className="w-full rounded-lg"
            options={organizations.map((org: any) => ({
              label: org.name,
              value: org.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="display_name"
          label={
            <span className="font-semibold text-slate-700">Display Name</span>
          }
          rules={[{ required: true, message: "Please enter display name" }]}
        >
          <Input placeholder="e.g. Engineering" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <span className="font-semibold text-slate-700">Unique Name</span>
          }
          rules={[{ required: true, message: "Please enter unique name" }]}
        >
          <Input placeholder="e.g. engineering" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span className="font-semibold text-slate-700">Team Email</span>
          }
          rules={[
            { required: true, message: "Please enter team email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="team@example.com" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item
          name="team_type"
          label={
            <span className="font-semibold text-slate-700">Team Type</span>
          }
          rules={[{ required: true, message: "Please select team type" }]}
        >
          <Select size="large" className="w-full rounded-lg">
            <Select.Option value="group">Group</Select.Option>
            <Select.Option value="organization">Organization</Select.Option>
            <Select.Option value="department">Department</Select.Option>
            <Select.Option value="division">Division</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="parent_team_id"
          label={
            <span className="font-semibold text-slate-700">Parent Team</span>
          }
          className="col-span-2"
        >
          <Select
            placeholder="Select parent team (optional)"
            allowClear
            size="large"
            className="w-full rounded-lg"
          >
            {teams.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {t.display_name} ({t.name})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="domain_id"
          label={<span className="font-semibold text-slate-700">Domain</span>}
          className="col-span-2"
        >
          <Select
            placeholder="Select a domain (optional)"
            allowClear
            size="large"
            className="w-full rounded-lg"
            options={[
              { label: "Finance", value: "finance" },
              { label: "Marketing", value: "marketing" },
              { label: "Operations", value: "operations" },
              { label: "Data Platform", value: "data-platform" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span className="font-semibold text-slate-700">Description</span>
          }
          className="col-span-2"
        >
          <Input.TextArea
            placeholder="Enter team description"
            rows={4}
            className="rounded-lg"
          />
        </Form.Item>

        <div className="col-span-2 flex gap-8 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
          <Form.Item
            name="public_team_view"
            label={
              <span className="font-semibold text-slate-700">Public View</span>
            }
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label={
              <span className="font-semibold text-slate-700">
                Active Status
              </span>
            }
            valuePropName="checked"
            className="mb-0"
          >
            <Switch />
          </Form.Item>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
        <Link href="/settings/organization-team-user-management/teams">
          <Button className="h-10 rounded-lg px-6 font-semibold">Cancel</Button>
        </Link>
        <Button
          type="primary"
          htmlType="submit"
          loading={isCreating}
          className="h-10 rounded-lg px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
        >
          Create Team
        </Button>
      </div>
    </Form>
  );
}
