"use client";

import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { Lock } from "lucide-react";
import { useResetPassword } from "../hooks/useResetPassword";
import { ResetPasswordRequest } from "../types";
import { PasswordGuidance } from "@/shared/components/ui/PasswordGuidance";
import { passwordValidator } from "@/shared/utils/validation";

interface ResetPasswordModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onCancel: () => void;
}

export function ResetPasswordModal({
  userId,
  userName,
  open,
  onCancel,
}: ResetPasswordModalProps) {
  const [form] = Form.useForm();
  const resetMutation = useResetPassword(userId);

  const handleSubmit = async (values: ResetPasswordRequest) => {
    try {
      await resetMutation.mutateAsync(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Lock className="h-5 w-5 text-blue-600" />
          <span>Reset User Password</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnHidden
      width={450}
      className="reset-password-modal"
    >
      <div className="mb-6 pt-2">
        <p className="text-slate-500 text-[14px] leading-relaxed">
          Enter a new password for{" "}
          <span className="font-bold text-slate-900">{userName}</span>. The user
          will need to use this new password for their next login.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="space-y-4"
      >
        <Form.Item
          name="new_password"
          label={
            <span className="text-[13px] font-bold text-slate-700">
              New Password
            </span>
          }
          rules={[
            { required: true, message: "Please enter a new password" },
            { validator: passwordValidator },
          ]}
        >
          <div className="flex flex-col">
            <Input.Password
              placeholder="Enter new password"
              className="h-11 rounded-lg border-slate-200 focus:border-blue-500"
            />
            <PasswordGuidance />
          </div>
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label={
            <span className="text-[13px] font-bold text-slate-700">
              Confirm Password
            </span>
          }
          dependencies={["new_password"]}
          rules={[
            { required: true, message: "Please confirm the password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm new password"
            className="h-11 rounded-lg border-slate-200 focus:border-blue-500"
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-8">
          <Button
            onClick={onCancel}
            className="h-10 px-6 rounded-lg font-bold text-slate-500 border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={resetMutation.isPending}
            className="h-10 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-100"
          >
            Reset Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
