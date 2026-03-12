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
import { PasswordGuidance } from "@/shared/components/ui/PasswordGuidance";
import { passwordValidator } from "@/shared/utils/validation";

const domainOptions = [
  { label: "Finance", value: "finance" },
  { label: "Marketing", value: "marketing" },
  { label: "Operations", value: "operations" },
  { label: "Data Platform", value: "data-platform" },
];

export default function CreateUserPage() {
  const [form] = Form.useForm();
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const { roles: rolesData, isLoading: isLoadingRoles } = useRoles({
    skip: 0,
    limit: 100,
  });
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const router = useRouter();

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

      message.success("User created successfully");
      router.push("/settings/organization-team-user-management/users");
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
    <div className="flex flex-col space-y-4 animate-in fade-in duration-500 max-w-[1100px] mx-auto">

      <PageHeader
        title="Create User"
        description="Add a new user to your organization."
        breadcrumbItems={breadcrumbItems}
      />

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm p-5">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_admin: false }}
          requiredMark={false}
        >

          {/* USER INFO */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              User Info
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">

              <Form.Item
                name="email"
                label={<span className="font-medium text-slate-700">Email</span>}
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input
                  placeholder="user@example.com"
                  className="h-9 rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="display_name"
                label={<span className="font-medium text-slate-700">Display Name</span>}
                rules={[{ required: true, message: "Display name required" }]}
              >
                <Input
                  placeholder="John Doe"
                  className="h-9 rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="font-medium text-slate-700">Password</span>}
                rules={[
                  { required: true, message: "Password is required" },
                  { validator: passwordValidator },
                ]}
              >
                <div className="flex flex-col">
                  <Input.Password
                    placeholder="Min 8 characters"
                    className="h-9 rounded-md"
                  />
                  <PasswordGuidance />
                </div>
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label={<span className="font-medium text-slate-700">Confirm Password</span>}
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Repeat password"
                  className="h-9 rounded-md"
                />
              </Form.Item>

            </div>
          </div>

          {/* ROLE SECTION */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Role Assignment
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">

              <Form.Item
                name="role_ids"
                label={<span className="font-medium text-slate-700">Roles</span>}
              >
                <Select
                  mode="multiple"
                  placeholder="Select roles"
                  loading={isLoadingRoles}
                  size="middle"
                  options={rolesData?.map((r: any) => ({
                    label: r.name,
                    value: r.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="domain_ids"
                label={<span className="font-medium text-slate-700">Domains</span>}
              >
                <Select
                  mode="multiple"
                  placeholder="Select domains"
                  size="middle"
                  options={domainOptions}
                />
              </Form.Item>

              <Form.Item
                name="is_admin"
                label={<span className="font-medium text-slate-700">Admin Access</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

            </div>
          </div>

          {/* TEAM SECTION */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Team Assignment
            </h3>

            <Form.Item
              name="team_ids"
              label={<span className="font-medium text-slate-700">Teams</span>}
            >
              <Select
                mode="multiple"
                placeholder="Select teams"
                loading={isLoadingTeams}
                size="middle"
                options={teams.map((t: any) => ({
                  label: t.display_name,
                  value: t.id,
                }))}
              />
            </Form.Item>
          </div>

          {/* ADDITIONAL INFO */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Additional Info
            </h3>

            <Form.Item
              name="description"
              label={<span className="font-medium text-slate-700">Description</span>}
            >
              <Input.TextArea
                placeholder="e.g. Data Engineer"
                rows={2}
                className="rounded-md"
              />
            </Form.Item>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">

            <Link href="/settings/organization-team-user-management/users">
              <Button className="h-9 rounded-md px-5 font-semibold">
                Cancel
              </Button>
            </Link>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="h-9 rounded-md px-6 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Create User
            </Button>

          </div>

        </Form>
      </Card>
    </div>
  );
}