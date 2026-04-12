"use client";

import React, { useState } from "react";
import { Form, Modal, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { Inbox, UploadCloud } from "lucide-react";

interface UploadNotebookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  isSubmitting: boolean;
}

export function UploadNotebookModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: UploadNotebookModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleClose = () => {
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-[16px]">
          <UploadCloud size={18} className="text-blue-600" />
          Upload Notebook
        </div>
      }
      open={open}
      onCancel={handleClose}
      onOk={async () => {
        const file = fileList[0]?.originFileObj;
        if (!(file instanceof File)) {
          message.error("Please select a notebook file.");
          return;
        }

        await onSubmit(file);
        setFileList([]);
      }}
      okText="Upload Notebook"
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      destroyOnHidden
      width={520}
    >
      <Form layout="vertical" className="mt-5">
        <Form.Item
          label="Notebook File"
          required
          tooltip="Upload an .ipynb notebook file."
        >
          <Upload.Dragger
            multiple={false}
            maxCount={1}
            accept=".ipynb"
            fileList={fileList}
            beforeUpload={(file) => {
              if (!file.name.toLowerCase().endsWith(".ipynb")) {
                message.error("Only .ipynb notebook files are supported.");
                return Upload.LIST_IGNORE;
              }
              return false;
            }}
            onChange={(info) => setFileList(info.fileList)}
            className="bg-slate-50/50 border-dashed border-2 border-slate-200"
          >
            <div className="py-6 flex flex-col items-center justify-center">
              <p className="mb-2 flex justify-center text-blue-500">
                <Inbox size={36} />
              </p>
              <p className="font-medium text-slate-700">
                Click or drag notebook file to upload
              </p>
              <p className="mt-2 px-6 text-[13px] text-slate-400">
                Upload an existing Jupyter notebook and continue editing it inside DeltaMeta.
              </p>
            </div>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}
