"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Upload, message, Button } from "antd";
import { Inbox, FileUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "../services/file.service";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function FileUploadModal({ open, onClose }: FileUploadModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (values: any) => {
      const fileToUpload = fileList[0]?.originFileObj;
      if (!fileToUpload) {
        throw new Error("No file selected.");
      }

      const additionalData: Record<string, any> = {};
      if (values.storage_config_id) {
        additionalData.storage_config_id = values.storage_config_id;
      }

      return fileService.uploadFile(fileToUpload, additionalData);
    },
    onSuccess: () => {
      message.success("File uploaded successfully.");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      handleClose();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || error.message || "Failed to upload file.");
    },
  });

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleFinish = (values: any) => {
    if (fileList.length === 0) {
      message.error("Please select a file to upload.");
      return;
    }
    uploadMutation.mutate(values);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-[16px]">
          <FileUp size={18} className="text-indigo-600" />
          Upload Data File
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={500}
      className="custom-modal-title"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-6 font-medium"
      >
        <Form.Item
          label="Select File"
          required
          tooltip="Max file size 50MB. Allowed formats: CSV, TSV, Excel, JSON, Parquet."
        >
          <Upload.Dragger
            name="file"
            multiple={false}
            maxCount={1}
            accept=".csv,.tsv,.xls,.xlsx,.json,.parquet"
            fileList={fileList}
            beforeUpload={(file) => {
              const allowedExtensions = [".csv", ".tsv", ".xls", ".xlsx", ".json", ".parquet"];
              const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
              if (!allowedExtensions.includes(fileExtension)) {
                message.error(`Unsupported file format. Allowed formats: CSV, TSV, Excel, JSON, Parquet.`);
                return Upload.LIST_IGNORE;
              }
              return false; // Prevent automatic upload
            }}
            onChange={(info) => setFileList(info.fileList)}
            className="bg-slate-50/50 hover:bg-indigo-50/30 transition-colors border-dashed border-2 border-slate-200"
          >
            <div className="py-6 flex flex-col items-center justify-center">
              <p className="ant-upload-drag-icon text-indigo-400 mb-2 flex justify-center">
                <Inbox size={36} />
              </p>
              <p className="ant-upload-text font-medium text-slate-700">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint text-slate-400 text-[13px] mt-2 px-6">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.
              </p>
            </div>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          name="storage_config_id"
          label={<span className="text-slate-700">Storage Config ID <span className="text-slate-400 font-normal ml-1">(Optional)</span></span>}
          tooltip="Provide an explicit destination storage config ID. Otherwise, defaults to primary object store."
        >
          <Input 
            placeholder="e.g. strg_cfg_xs8v2" 
            className="h-10 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
          <Button onClick={handleClose} disabled={uploadMutation.isPending} className="font-semibold">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={uploadMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 border-none font-semibold px-6"
          >
            Upload
          </Button>
        </div>
      </Form>

      <style jsx global>{`
        .custom-modal-title .ant-modal-header {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
      `}</style>
    </Modal>
  );
}
