"use client";

import React, { useState } from "react";
import { Modal, Input, Checkbox, Avatar, Empty, Skeleton } from "antd";
import { Search } from "lucide-react";

interface ManagementSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (ids: string[]) => void;
  title: string;
  items: any[];
  isLoading: boolean;
  placeholder: string;
  itemType: "user" | "role" | "policy";
}

export function ManagementSelectionModal({
  open,
  onCancel,
  onConfirm,
  title,
  items,
  isLoading,
  placeholder,
  itemType,
}: ManagementSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const label = item.name || item.display_name || item.display_label || "";
    const subLabel = item.username || item.email || item.description || "";
    return (
      label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    setSelectedIds([]);
    setSearchQuery("");
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setSearchQuery("");
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okButtonProps={{ disabled: selectedIds.length === 0 }}
      okText="Add Selected"
      width={600}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4 mt-4">
        <Input
          prefix={<Search className="h-4 w-4 text-slate-400" />}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-lg"
        />

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton active avatar paragraph={{ rows: 1 }} />
              <Skeleton active avatar paragraph={{ rows: 1 }} />
              <Skeleton active avatar paragraph={{ rows: 1 }} />
            </div>
          ) : filteredItems.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`No available ${itemType}s found`}
              className="py-10"
            />
          ) : (
            <div className="flex flex-col">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 w-full cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-3 py-3 mb-1"
                  onClick={() => handleToggle(item.id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggle(item.id)}
                  />
                  {itemType === "user" && (
                    <Avatar className="bg-blue-600">
                      {(item.name || item.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-slate-900">
                      {item.name || item.display_name || item.display_label}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[400px]">
                      {itemType === "user"
                        ? `@${item.username} • ${item.email}`
                        : item.description || "No description provided"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
