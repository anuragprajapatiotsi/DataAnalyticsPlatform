"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Mail,
  Calendar,
} from "lucide-react";
import { message, Popconfirm, Button, Badge as AntBadge } from "antd";

import { orgsApi } from "@/services/api/orgs";
import { OrgModal } from "@/components/settings/org-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/utils/cn";

import { OrganizationsContent } from "@/components/settings/OrganizationsContent";

export default function OrganizationsPage() {
  return (
    <div className="h-full overflow-y-auto p-6 pb-20 custom-scrollbar animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Organizations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <OrganizationsContent />
      </div>
    </div>
  );
}
