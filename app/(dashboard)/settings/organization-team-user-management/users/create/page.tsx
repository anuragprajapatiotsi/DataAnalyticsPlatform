"use client";

import React from "react";
import { Form, Input, Switch, Select, Button } from "antd";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import { Card } from "@/shared/components/ui/card";
import { useRouter } from "next/navigation";
import { message } from "antd";
import Link from "next/link";
import { PageHeader } from "@/shared/components/layout/PageHeader";

const domainOptions = [
  { label: "Finance", value: "finance" },
  { label: "Marketing", value: "marketing" },
  { label: "Operations", value: "operations" },
  { label: "Data Platform", value: "data-platform" },
];

export default function CreateUserPage() {
  const [form] = Form.useForm();
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({
    skip: 0,
    limit: 100,
  });
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    {
      label: "Team & User Management",
      href: "/settings/organization-team-user-management",
    },
    {
      label: "Users",
      href: "/settings/organization-team-user-management/users",
    },
    { label: "Create User" },
  ];

  const handleSubmit = async (values: any) => {
    try {
      await createUser({
        ...values,
        team_ids: values.team_ids || [],
        role_ids: values.role_ids || [],
        domain_ids: values.domain_ids || [],
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <PageHeader
        title="Create User"
        description="Add a new user to your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_admin: false }}
          requiredMark={false}
        >
          {/* User Info Section */}
          <div>
            <h3 className="text-base font-bold text-slate-800 ">
              User Info
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="email"
                label={
                  <span className="font-semibold text-slate-700">
                    Email Address
                  </span>
                }
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input
                  placeholder="user@example.com"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="display_name"
                label={
                  <span className="font-semibold text-slate-700">
                    Display Name
                  </span>
                }
                rules={[
                  { required: true, message: "Display name is required" },
                ]}
              >
                <Input
                  placeholder="e.g. John Doe"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="font-semibold text-slate-700">Password</span>
                }
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 8, message: "Minimum 8 characters" },
                ]}
              >
                <Input.Password
                  placeholder="Min 8 characters"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label={
                  <span className="font-semibold text-slate-700">
                    Confirm Password
                  </span>
                }
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Repeat password"
                  className="h-10 rounded-lg"
                />
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
                label={
                  <span className="font-semibold text-slate-700">Roles</span>
                }
              >
                <Select
                  mode="multiple"
                  placeholder="Select roles"
                  loading={isLoadingRoles}
                  size="large"
                  className="w-full rounded-lg"
                  options={rolesData?.data?.map((r: any) => ({
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

          {/* Team Assignment Section */}
          <div className="mt-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">
              Team Assignment
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="team_ids"
                label={
                  <span className="font-semibold text-slate-700">Teams</span>
                }
                className="col-span-2"
              >
                <Select
                  mode="multiple"
                  placeholder="Select teams"
                  loading={isLoadingTeams}
                  size="large"
                  className="w-full rounded-lg"
                  options={teams.map((t: any) => ({
                    label: t.display_name,
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
              <Button className="h-10 rounded-lg px-6 font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="h-10 rounded-lg px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
            >
              Create User
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
