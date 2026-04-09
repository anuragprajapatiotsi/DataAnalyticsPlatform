"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Spin,
  Upload,
  Avatar,
} from "antd";
import { Upload as UploadIcon, X } from "lucide-react";
import { useAuth } from "@/shared/hooks/use-auth";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { authApi } from "@/shared/api/auth";
import type { UpdateProfileRequest } from "@/shared/types";

const { TextArea } = Input;

export function UserProfileForm() {
  const { user, updateProfile } = useAuth();
  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        display_name: user.display_name,
        description: user.description || "",
        image: user.image || "",
        default_org_id: user.org_id || "",
      });
      if (user.image) {
        setPreviewImage(user.image);
      }
    }
  }, [user, form]);

  const onFinish = async (values: UpdateProfileRequest) => {
    setSubmitting(true);
    try {
      let imageUrl = values.image;

      // 1. Upload new image if present
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const uploadRes = await authApi.uploadAvatar(fileList[0].originFileObj);
        imageUrl = uploadRes.url;
      }

      // 2. Update profile
      await updateProfile({
        ...values,
        image: imageUrl,
      });

      message.success("Profile updated successfully");
      setFileList([]);
    } catch (error) {
      // Error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG/WEBP files!");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setFileList([{ originFileObj: file }]);
    return false; // Prevent auto-upload
  };

  const handleReset = () => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        display_name: user.display_name,
        description: user.description || "",
        image: user.image || "",
        default_org_id: user.org_id || "",
      });
      setPreviewImage(user.image || "");
      setFileList([]);
    }
  };

  if (!user) return <Spin />;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          className="max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <Form.Item
              label={
                <span className="text-sm font-medium text-slate-700">Name</span>
              }
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                placeholder="Internal name"
                className="h-10 rounded-lg border-slate-200"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-sm font-medium text-slate-700">
                  Display Name
                </span>
              }
              name="display_name"
              rules={[
                { required: true, message: "Please enter your display name" },
              ]}
            >
              <Input
                placeholder="User-facing name"
                className="h-10 rounded-lg border-slate-200"
              />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
            }
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Short description or job title"
              className="rounded-lg border-slate-200"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm font-medium text-slate-700">
                Profile Image
              </span>
            }
            name="image"
          >
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Avatar
                size={80}
                src={previewImage || undefined}
                className="border-2 border-white shadow-sm flex-shrink-0"
              >
                {user.display_name.charAt(0)}
              </Avatar>

              <div className="flex flex-col gap-2">
                <Upload
                  fileList={fileList}
                  beforeUpload={handleBeforeUpload}
                  onRemove={() => {
                    setFileList([]);
                    setPreviewImage(user.image || "");
                  }}
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button
                    icon={<UploadIcon size={16} />}
                    className="h-9 px-4 rounded-lg font-bold flex items-center gap-2 border-slate-200"
                  >
                    {previewImage ? "Change Image" : "Upload Image"}
                  </Button>
                </Upload>
                <p className="text-[12px] text-slate-400 font-medium">
                  JPG, PNG or WEBP. Max size 5MB.
                </p>
              </div>

              {previewImage !== user.image && (
                <Button
                  type="text"
                  danger
                  icon={<X size={16} />}
                  onClick={() => {
                    setFileList([]);
                    setPreviewImage(user.image || "");
                  }}
                  className="ml-auto flex items-center gap-1 font-bold h-8"
                >
                  Reset
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label={
              <span className="text-sm font-medium text-slate-700">
                Default Organization
              </span>
            }
            name="default_org_id"
            rules={[
              {
                required: true,
                message: "Please select a default organization",
              },
            ]}
          >
            <Select
              placeholder="Select Organization"
              className="h-10 w-full"
              loading={isLoadingOrgs}
              showSearch
              optionFilterProp="label"
              options={organizations.map((org) => ({
                label: org.name,
                value: org.id,
              }))}
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button
              className="h-10 px-6 rounded-lg font-bold border-slate-200 hover:bg-slate-50"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-8 rounded-lg font-bold shadow-md shadow-blue-100"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
