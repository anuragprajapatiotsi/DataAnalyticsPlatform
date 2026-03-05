"use client";

import React from "react";
import {
  FileBox,
  ExternalLink,
  Database,
  Layout,
  Settings,
  Zap,
  Box,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button, Empty, Badge } from "antd";
import type { TeamAsset } from "../../types";

interface TeamAssetsListProps {
  assets: TeamAsset[];
  isLoading?: boolean;
}

const AssetIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "dataset":
      return <Database className="h-4 w-4 text-blue-500" />;
    case "dashboard":
      return <Layout className="h-4 w-4 text-purple-500" />;
    case "pipeline":
      return <Zap className="h-4 w-4 text-amber-500" />;
    case "topic":
      return <Settings className="h-4 w-4 text-emerald-500" />;
    default:
      return <Box className="h-4 w-4 text-slate-400" />;
  }
};

export function TeamAssetsList({ assets, isLoading }: TeamAssetsListProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-slate-900 m-0">Assets</h2>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span>Fetching assets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-medium">
                          No assets owned by this team
                        </span>
                        <span className="text-slate-400 text-[13px]">
                          Assign assets to this team to keep them here.
                        </span>
                      </div>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className="group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AssetIcon type={asset.type} />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[14px]">
                          {asset.name}
                        </span>
                        {asset.description && (
                          <span className="text-[12px] text-slate-400 line-clamp-1">
                            {asset.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className="bg-slate-100 text-slate-600 border-none capitalize px-2 py-0.5">
                      {asset.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 text-[14px]">
                    {asset.owner || "No Owner"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="text"
                      icon={
                        <ExternalLink
                          size={16}
                          className="text-slate-400 hover:text-blue-600"
                        />
                      }
                      className="hover:bg-slate-100 rounded-lg h-8 w-8 flex items-center justify-center p-0 ml-auto"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
