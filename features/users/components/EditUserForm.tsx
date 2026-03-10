"use client";

import React, { useEffect } from "react";
import { Form, Input, Switch, Select, Button, message } from "antd";
import { useRouter } from "next/navigation";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { AdminUser } from "../types";
import Link from "next/link";

interface EditUserFormProps {
  user: AdminUser;
}

const domainOptions = [
  { label: "Finance", value: "finance" },
  { label: "Marketing", value: "marketing" },
  { label: "Operations", value: "operations" },
  { label: "Data Platform", value: "data-platform" },
];

export function EditUserForm({ user }: EditUserFormProps) {
  const [form] = Form.useForm();
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const { roles: rolesData, isLoading: isLoadingRoles } = useRoles({
    skip: 0,
    limit: 100,
  });
  const { mutateAsync: updateUser, isPending } = useUpdateUser(user.id);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        display_name: user.display_name,
        description: user.description,
        is_admin: user.is_admin,
        is_active: user.is_active,
        team_ids: user.teams?.map((t) => t.id) || [],
        role_ids: user.roles?.map((r) => r.id) || [],
        // Assuming domains are stored somewhere, but not explicitly in AdminUser type shown
        // Pre-filling with empty if not available
        domain_ids: [],
      });
    }
  }, [user, form]);

  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      await updateUser({
        ...values,
        team_ids: values.team_ids || [],
        role_ids: values.role_ids || [],
        domain_ids: values.domain_ids || [],
      });
      message.success("User updated successfully");
      router.push("/settings/organization-team-user-management/users");
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
      initialValues={{ is_active: true }}
    >
      {/* User Info Section */}
      <div>
        <h3 className="text-base font-bold text-slate-800 ">User Info</h3>
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            label={
              <span className="font-semibold text-slate-700">
                Email Address (Not Editable)
              </span>
            }
          >
            <Input
              value={user.email}
              disabled
              className="h-10 rounded-lg bg-slate-50 border-slate-200"
            />
          </Form.Item>

          <Form.Item
            name="display_name"
            label={
              <span className="font-semibold text-slate-700">Display Name</span>
            }
            rules={[{ required: true, message: "Display name is required" }]}
          >
            <Input placeholder="e.g. John Doe" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label={
              <span className="font-semibold text-slate-700">
                Active Status
              </span>
            }
            valuePropName="checked"
          >
            <Switch className="bg-slate-200" />
          </Form.Item>

          <Form.Item
            name="is_admin"
            label={
              <span className="font-semibold text-slate-700">
                Grant Admin Access
              </span>
            }
            valuePropName="checked"
          >
            <Switch className="bg-slate-200" />
          </Form.Item>
        </div>
      </div>

      {/* Role Assignment Section */}
      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          Role Assignment
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            name="role_ids"
            label={<span className="font-semibold text-slate-700">Roles</span>}
          >
            <Select
              mode="multiple"
              placeholder="Select roles"
              loading={isLoadingRoles}
              size="large"
              className="w-full rounded-lg"
              options={rolesData?.map((r: any) => ({
                label: r.name,
                value: r.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="domain_ids"
            label={
              <span className="font-semibold text-slate-700">Domains</span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select domains"
              size="large"
              className="w-full rounded-lg"
              options={domainOptions}
            />
          </Form.Item>
        </div>
      </div>

      {/* Team Assignment Section */}
      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          Team Assignment
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            name="team_ids"
            label={<span className="font-semibold text-slate-700">Teams</span>}
            className="col-span-2"
          >
            <Select
              mode="multiple"
              placeholder="Select teams"
              loading={isLoadingTeams}
              size="large"
              className="w-full rounded-lg"
              options={teams.map((t: any) => ({
                label: t.display_name || t.name,
                value: t.id,
              }))}
            />
          </Form.Item>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-800 mb-4">
          Additional Info
        </h3>
        <Form.Item
          name="description"
          label={
            <span className="font-semibold text-slate-700">
              Description / Job Title
            </span>
          }
        >
          <Input.TextArea
            placeholder="e.g. Data Engineer"
            rows={4}
            className="rounded-lg"
          />
        </Form.Item>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
        <Link href="/settings/organization-team-user-management/users">
          <Button className="h-10 rounded-lg px-6 font-semibold">Cancel</Button>
        </Link>
        <Button
          type="primary"
          htmlType="submit"
          loading={isPending}
          className="h-10 rounded-lg px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
        >
          Update User
        </Button>
      </div>
    </Form>
  );
}
