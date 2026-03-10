"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  ChevronRight,
  ChevronDown,
  Table,
  View,
  Zap,
  Search,
  Box,
  FileText,
  Loader2,
} from "lucide-react";
import { metadataApi } from "@/shared/api/metadata";
import type { SchemaNode, SchemaNodeType } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

interface NodeState extends SchemaNode {
  isOpen: boolean;
  isLoading: boolean;
  children: NodeState[];
}

const getIcon = (type: SchemaNodeType) => {
  switch (type) {
    case "database":
      return Database;
    case "schema":
      return Search;
    case "table":
      return Table;
    case "view":
      return View;
    case "function":
      return Zap;
    case "column":
      return FileText;
    default:
      return Box;
  }
};

export function SchemaExplorer() {
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of schemas
    const fetchRoot = async () => {
      setLoading(true);
      try {
        const schemas = await metadataApi.getSchemas();
        setNodes(
          schemas.map((s) => ({
            ...s,
            isOpen: false,
            isLoading: false,
            children: [],
          })),
        );
      } catch (error) {
        console.error("Failed to fetch schemas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoot();
  }, []);

  const toggleNode = async (targetNode: NodeState) => {
    if (!targetNode.hasChildren) return;

    const isOpening = !targetNode.isOpen;

    // Update state to toggle open/close and set loading if opening and no children
    setNodes((prev) =>
      updateNodeState(prev, targetNode.id, {
        isOpen: isOpening,
        isLoading: isOpening && targetNode.children.length === 0,
      }),
    );

    if (isOpening && targetNode.children.length === 0) {
      try {
        let children: SchemaNode[] = [];
        if (targetNode.type === "schema") {
          children = await metadataApi.getTables(targetNode.name);
        } else if (targetNode.type === "table") {
          children = await metadataApi.getColumns(
            targetNode.schemaName!,
            targetNode.name,
          );
        }

        setNodes((prev) =>
          updateNodeState(prev, targetNode.id, {
            isLoading: false,
            children: children.map((c) => ({
              ...c,
              isOpen: false,
              isLoading: false,
              children: [],
            })),
          }),
        );
      } catch (error) {
        console.error("Failed to fetch children", error);
        setNodes((prev) =>
          updateNodeState(prev, targetNode.id, { isLoading: false }),
        );
      }
    }
  };

  const updateNodeState = (
    nodeList: NodeState[],
    id: string,
    updates: Partial<NodeState>,
  ): NodeState[] => {
    return nodeList.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateNodeState(node.children, id, updates),
        };
      }
      return node;
    });
  };

  const renderNode = (node: NodeState, depth: number = 0) => {
    const Icon = getIcon(node.type);

    return (
      <div key={node.id} className="flex flex-col">
        <div
          className={cn(
            "flex items-center py-1 px-2 cursor-pointer hover:bg-slate-100 rounded text-sm group transition-colors",
            node.isOpen && "font-medium",
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
          onClick={() => toggleNode(node)}
        >
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {node.hasChildren &&
              (node.isOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              ))}
          </div>
          <Icon
            size={14}
            className="mr-2 text-slate-500 group-hover:text-blue-600 transition-colors"
          />
          <span className="truncate flex-1">{node.name}</span>
          {node.isLoading && (
            <Loader2 size={12} className="animate-spin text-blue-500 ml-2" />
          )}
        </div>
        {node.isOpen &&
          node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Explorer
        </h3>
        {loading && (
          <Loader2 size={12} className="animate-spin text-slate-400" />
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {nodes.length === 0 && !loading ? (
          <div className="text-xs text-slate-400 p-4 text-center italic">
            No schemas found
          </div>
        ) : (
          nodes.map((node) => renderNode(node))
        )}
      </div>
    </div>
  );
}
