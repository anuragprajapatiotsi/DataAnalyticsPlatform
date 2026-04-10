"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Table,
  Box,
  Loader2,
  FolderOpen,
  Layers,
  Package,
  Database,
  Type,
  Folders,
  Activity,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useSqlEditorContext } from "../contexts/SqlEditorContext";
import { serviceService } from "@/features/services/services/service.service";
import { CATALOG_VIEWS_UPDATED_EVENT } from "../constants";

type ExplorerNodeType =
  | "catalog"
  | "folder"
  | "trino-service"
  | "database"
  | "schema"
  | "table"
  | "column"
  | "connection"
  | "placeholder"
  | "load-more";

interface ExplorerNode {
  id: string;
  name: string;
  type: ExplorerNodeType;
  hasChildren: boolean;
  children: ExplorerNode[];
  catalog?: string;
  schema?: string;
  table?: string;
  connection_id?: string;
  database?: string;
  asset_id?: string;
  data_type?: string;
  error?: string | null;
  isLoaded?: boolean;
  visibleCount?: number;
}

const getIcon = (type: ExplorerNodeType) => {
  switch (type) {
    case "catalog":
      return Layers;
    case "folder":
      return FolderOpen;
    case "trino-service":
      return Box;
    case "database":
      return Database;
    case "schema":
      return Layers;
    case "table":
      return Table;
    case "column":
      return Type;
    case "connection":
      return Activity;
    case "load-more":
      return FolderOpen;
    case "placeholder":
      return Package;
    default:
      return Box;
  }
};

function getInitialTreeData(): ExplorerNode[] {
  return [
    {
      id: "root-catalog_views",
      name: "Catalog Views",
      type: "folder",
      hasChildren: true,
      children: [],
      isLoaded: false,
    },
    {
      id: "root-data-assets",
      name: "Data Assets",
      type: "folder",
      catalog: "iceberg",
      schema: "catalog_views",
      hasChildren: true,
      children: [],
      isLoaded: false,
    },
    {
      id: "root-sources",
      name: "Sources",
      type: "folder",
      hasChildren: true,
      children: [
        {
          id: "source-databases",
          name: "Database Sources",
          type: "database",
          hasChildren: true,
          children: [],
          isLoaded: false,
        },
      ],
      isLoaded: true,
    },
  ];
}

function findExpandedUnloadedNode(
  nodes: ExplorerNode[],
  expandedKeys: Set<string>,
): ExplorerNode | null {
  for (const node of nodes) {
    if (expandedKeys.has(node.id) && node.hasChildren && !node.isLoaded) {
      return node;
    }

    if (node.children.length > 0) {
      const nested = findExpandedUnloadedNode(node.children, expandedKeys);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function shouldRefetchCatalogViewNode(node: ExplorerNode) {
  return (
    node.id === "root-catalog_views" ||
    (node.type === "catalog" && node.catalog === "iceberg") ||
    (node.type === "schema" && !!node.catalog && !node.connection_id) ||
    (node.type === "table" && !!node.catalog && !node.connection_id && !node.asset_id)
  );
}

export function SchemaExplorer() {
  const router = useRouter();
  const { activeTabId, updateTabQuery, updateTabContext } =
    useSqlEditorContext();

  // Core State with dual-discovery roots
  const [treeData, setTreeData] = useState<ExplorerNode[]>(getInitialTreeData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    "root-catalog_views",
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(["root-catalog_views"]),
  );

  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  const updateTreeNodes = useCallback((
    nodeList: ExplorerNode[],
    id: string,
    updates: Partial<ExplorerNode>,
  ): ExplorerNode[] => {
    return nodeList.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateTreeNodes(node.children, id, updates),
        };
      }
      return node;
    });
  }, []);

  const toggleNode = useCallback(async (targetNode: ExplorerNode) => {
    // Handle Load More
    if (targetNode.type === "load-more") {
      const parentId = targetNode.id.replace("load-more-", "");
      setTreeData((prev) => {
        const updateVisibleCount = (nodes: ExplorerNode[]): ExplorerNode[] => {
          return nodes.map((node) => {
            if (node.id === parentId) {
              return { ...node, visibleCount: (node.visibleCount || 10) + 10 };
            }
            if (node.children && node.children.length > 0) {
              return { ...node, children: updateVisibleCount(node.children) };
            }
            return node;
          });
        };
        return updateVisibleCount(prev);
      });
      return;
    }

    const isExpanded = expandedKeys.has(targetNode.id);
    const isLoading = loadingNodes.has(targetNode.id);

    if (isLoading || targetNode.error) return;

    // Discovery Diagnostics
    console.info(
      `[SQL Explorer] Toggle Node: ${targetNode.name} (${targetNode.id}), type: ${targetNode.type}, isExpanded: ${isExpanded}`,
    );

    // Removed Source Navigation Redirection to allow hierarchical expansion
    /*
    if (targetNode.id === "source-databases") {
      router.push("/sql-editor/sources/databases");
      setSelectedNodeId(targetNode.id);
      return;
    }
    */

    // Toggle Expansion State immediately for UX snappiness
    const shouldOpen = !isExpanded;
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (shouldOpen) next.add(targetNode.id);
      else next.delete(targetNode.id);
      return next;
    });

    // Handle Asset Selection (Tables/Databases)
    if (targetNode.type === "table" || targetNode.type === "database") {
      setSelectedNodeId(targetNode.id);
      if (activeTabId) {
        updateTabContext(activeTabId, {
          catalog: targetNode.catalog || "iceberg",
          schema: targetNode.schema || "catalog_views",
          table: targetNode.name,
        });
        updateTabQuery(
          activeTabId,
          `SELECT * FROM ${targetNode.name} LIMIT 10`,
        );
      }
    } else if (targetNode.type === "column") {
      setSelectedNodeId(targetNode.id);
    }

    // Handle Discovery/Loading for Dynamic Folders
    if (
      shouldOpen &&
      targetNode.hasChildren &&
      (!targetNode.isLoaded || shouldRefetchCatalogViewNode(targetNode))
    ) {
      setLoadingNodes((prev) => new Set(prev).add(targetNode.id));

      try {
        let children: ExplorerNode[] = [];

        if (targetNode.id === "root-catalog_views") {
          children = [
            {
              id: "catalog-iceberg",
              name: "iceberg",
              type: "catalog",
              catalog: "iceberg",
              hasChildren: true,
              children: [],
              isLoaded: false,
            },
          ];
        } else if (targetNode.type === "catalog" && targetNode.catalog) {
          const schemas = await serviceService.getTrinoSchemas(targetNode.catalog);
          const validSchemas = (Array.isArray(schemas) ? schemas : []).filter(
            (schema) =>
              schema.name !== "catalog_views" &&
              schema.name !== "information_schema",
          );

          if (validSchemas.length === 0) {
            children = [
              {
                id: `empty-catalog-${targetNode.id}`,
                name: "No schemas found",
                type: "placeholder",
                hasChildren: false,
                children: [],
              },
            ];
          } else {
            children = validSchemas.map((schema) => ({
              id: `trino-schema-${targetNode.catalog}-${schema.name}`,
              name: schema.name,
              type: "schema",
              catalog: targetNode.catalog,
              schema: schema.name,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.id === "source-databases") {
          // Level 1: Connections Discovery
          const result = await serviceService.getServiceEndpointsByType("databases", undefined, "primary");
          // The API might return categories or flat connections depending on the logic in service.service.ts
          let connections: any[] = [];
          if (Array.isArray(result)) {
             // If it's categories, flatten them
             if (result.length > 0 && result[0].connections) {
               connections = result.flatMap((cat: any) => cat.connections || []);
             } else {
               connections = result;
             }
          }

          if (connections.length === 0) {
            children = [{
              id: `empty-src-${targetNode.id}`,
              name: "No database connections found",
              type: "placeholder",
              hasChildren: false,
              children: []
            }];
          } else {
            children = connections.map((conn: any) => ({
              id: `conn-${conn.id}`,
              name: conn.service_name,
              type: "connection",
              connection_id: conn.id,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.id === "root-data-assets") {
          const assets = await serviceService.getDataAssets({ limit: 100 });
          const rawAssets = (Array.isArray(assets) ? assets : []).filter(
            (item: any) =>
              item.asset_type &&
              ["table", "view"].includes(item.asset_type.toLowerCase()),
          );
          if (rawAssets.length === 0) {
            children = [
              {
                id: `empty-da-${targetNode.id}`,
                name: "No platform assets found",
                type: "placeholder",
                hasChildren: false,
                children: [],
              },
            ];
          } else {
            children = rawAssets.map((item: any) => ({
              id: `da-${item.id}`,
              name:
                item.display_name || item.name || item.sn || "Unnamed Asset",
              type:
                item.asset_type === "view" || item.asset_type === "table"
                  ? "table"
                  : item.type === "database"
                    ? "database"
                    : "table",
              catalog: item.extra_metadata?.catalog || "iceberg",
              schema: item.extra_metadata?.schema || "catalog_views",
              table: item.name,
              asset_id: item.id,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.type === "connection") {
          // Level 2: Databases Discovery
          const dbs = await serviceService.getDatabases(targetNode.connection_id!);
          if (!dbs || dbs.length === 0) {
            children = [{
              id: `empty-db-${targetNode.id}`,
              name: "No databases found",
              type: "placeholder",
              hasChildren: false,
              children: []
            }];
          } else {
            children = dbs.map((db: any) => ({
              id: `db-${targetNode.connection_id}-${db.name}`,
              name: db.name,
              type: "database",
              connection_id: targetNode.connection_id,
              database: db.name,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.type === "database" && targetNode.connection_id) {
          // Level 3: Schemas Discovery
          const schemas = await serviceService.getSchemas(targetNode.connection_id, targetNode.database!);
          if (!schemas || schemas.length === 0) {
            children = [{
              id: `empty-schema-${targetNode.id}`,
              name: "No schemas found",
              type: "placeholder",
              hasChildren: false,
              children: []
            }];
          } else {
            children = schemas.map((sch: any) => ({
              id: `sch-${targetNode.connection_id}-${targetNode.database}-${sch.name}`,
              name: sch.name,
              type: "schema",
              connection_id: targetNode.connection_id,
              database: targetNode.database,
              schema: sch.name,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.type === "schema" && targetNode.connection_id) {
          // Level 4: Tables/Objects Discovery
          const objects = await serviceService.getDBObjects(targetNode.connection_id, targetNode.database!, targetNode.schema!);
          if (!objects || objects.length === 0) {
            children = [{
              id: `empty-obj-${targetNode.id}`,
              name: "No tables found",
              type: "placeholder",
              hasChildren: false,
              children: []
            }];
          } else {
            children = objects.map((obj: any) => ({
              id: `obj-${targetNode.connection_id}-${targetNode.database}-${targetNode.schema}-${obj.name}`,
              name: obj.name,
              type: "table",
              connection_id: targetNode.connection_id,
              database: targetNode.database,
              schema: targetNode.schema,
              table: obj.name,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.type === "schema" && targetNode.catalog) {
          const tables = await serviceService.getTrinoTables(
            targetNode.catalog,
            targetNode.schema!,
          );

          if (!tables || tables.length === 0) {
            children = [{
              id: `empty-trino-table-${targetNode.id}`,
              name: "No tables found",
              type: "placeholder",
              hasChildren: false,
              children: []
            }];
          } else {
            children = tables.map((table) => ({
              id: `trino-table-${targetNode.catalog}-${targetNode.schema}-${table.name}`,
              name: table.name,
              type: "table",
              catalog: targetNode.catalog,
              schema: targetNode.schema,
              table: table.name,
              hasChildren: true,
              children: [],
              isLoaded: false,
            }));
          }
        } else if (targetNode.type === "table") {
          if (targetNode.asset_id) {
            // New Requirement: Data Asset Native API Pathway
            const columns = await serviceService.getDataAssetColumns(targetNode.asset_id);
            children = (columns || []).map((col: any) => ({
              id: `col-da-${targetNode.asset_id}-${col.id || col.name}`,
              name: col.display_name || col.name,
              type: "column",
              data_type: col.data_type,
              hasChildren: false,
              children: [],
              isLoaded: true,
            }));

            if (children.length === 0) {
              children = [{
                id: `empty-da-${targetNode.id}`,
                name: "No columns available",
                type: "placeholder",
                hasChildren: false,
                children: []
              }];
            }
          } else if (targetNode.connection_id) {
            // Level 5: Columns Discovery for Database Sources
            const detail = await serviceService.getTableDetail(
              targetNode.connection_id,
              targetNode.database!,
              targetNode.schema!,
              targetNode.table!
            );
            
            children = (detail?.columns || []).map((col: any) => ({
              id: `col-src-${targetNode.connection_id}-${targetNode.database}-${targetNode.schema}-${targetNode.table}-${col.name}`,
              name: col.name,
              type: "column",
              data_type: col.data_type,
              hasChildren: false,
              children: [],
              isLoaded: true,
            }));

            if (children.length === 0) {
              children = [{
                id: `empty-col-${targetNode.id}`,
                name: "No columns available",
                type: "placeholder",
                hasChildren: false,
                children: []
              }];
            }
          } else {
            // Trino-backed catalog views pathway
            const catalog = targetNode.catalog || "iceberg";
            const schema = targetNode.schema || "catalog_views";
  
            const detail = await serviceService.getTrinoTableDetail(
              catalog,
              schema,
              targetNode.name,
            );
  
            children = (detail?.columns || []).map((item) => ({
              id: `column-${catalog}-${schema}-${targetNode.name}-${item.name}`,
              name: item.name,
              type: "column",
              catalog: catalog,
              schema: schema,
              table: targetNode.name,
              data_type: item.type,
              hasChildren: false,
              children: [],
              isLoaded: true,
            }));

            if (children.length === 0) {
              children = [{
                id: `empty-trino-col-${targetNode.id}`,
                name: "No columns available",
                type: "placeholder",
                hasChildren: false,
                children: []
              }];
            }
          }
        }

        setTreeData((prev) =>
          updateTreeNodes(prev, targetNode.id, {
            children,
            isLoaded: true,
            error: null,
          }),
        );
      } catch (error: any) {
        console.error("Discovery Error", error);
        // Fallback for visual stability
        setTreeData((prev) =>
          updateTreeNodes(prev, targetNode.id, {
            error: "Failed to Discover items",
            isLoaded: false,
          }),
        );
      } finally {
        setLoadingNodes((prev) => {
          const next = new Set(prev);
          next.delete(targetNode.id);
          return next;
        });
      }
    }
  }, [activeTabId, expandedKeys, loadingNodes, updateTabContext, updateTabQuery, updateTreeNodes]);

  useEffect(() => {
    const staleExpandedNode = findExpandedUnloadedNode(treeData, expandedKeys);
    if (!staleExpandedNode || loadingNodes.has(staleExpandedNode.id)) {
      return;
    }

    void toggleNode(staleExpandedNode);
  }, [expandedKeys, loadingNodes, toggleNode, treeData]);

  useEffect(() => {
    const handleCatalogViewsUpdated = () => {
      setTreeData((prev) =>
        updateTreeNodes(prev, "root-catalog_views", {
          children: [],
          isLoaded: false,
          error: null,
        }),
      );
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.add("root-catalog_views");
        return next;
      });
    };

    window.addEventListener(
      CATALOG_VIEWS_UPDATED_EVENT,
      handleCatalogViewsUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        CATALOG_VIEWS_UPDATED_EVENT,
        handleCatalogViewsUpdated as EventListener,
      );
    };
  }, [updateTreeNodes]);

  const renderNode = (node: ExplorerNode, depth: number = 0) => {
    const Icon = getIcon(node.type);
    const isOpen = expandedKeys.has(node.id);
    const isLoading = loadingNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;

    // Simplified chevron visibility for Step 1
    const isExpandable = node.hasChildren && !node.error;

    return (
      <div key={node.id} className="flex flex-col w-full">
        <div
          className={cn(
            "flex items-center py-2 px-3 cursor-pointer hover:bg-slate-100 rounded text-sm group transition-all",
            isOpen || isSelected
              ? "font-bold text-blue-600 mb-0.5"
              : "text-slate-600",
            isSelected && "bg-blue-50 ring-1 ring-blue-100/50",
            node.type === "placeholder" && "opacity-40 italic",
            node.type === "load-more" &&
              "text-blue-500 hover:text-blue-700 italic font-semibold mt-1",
            node.error && "opacity-60",
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
          onClick={() => toggleNode(node)}
        >
          <div className="w-5 h-5 mr-1 flex items-center justify-center shrink-0">
            {isLoading ? (
              <Loader2 size={12} className="animate-spin text-blue-500" />
            ) : isExpandable ? (
              isOpen ? (
                <ChevronDown size={14} className="text-blue-500" />
              ) : (
                <ChevronRight
                  size={14}
                  className="text-slate-400 group-hover:text-blue-400"
                />
              )
            ) : null}
          </div>
          <Icon
            size={16}
            className={cn(
              "mr-2 shrink-0 transition-colors",
              isOpen || isSelected
                ? "text-blue-500"
                : "text-slate-400 group-hover:text-blue-500",
              node.error && "text-slate-300",
            )}
          />
          <span className="truncate flex-1 tracking-tight select-none">
            {node.name}
          </span>
          {node.type === "column" && node.data_type && (
            <span className="text-[10px] font-mono text-slate-400 opacity-70 ml-2 uppercase truncate max-w-[80px]">
              {node.data_type}
            </span>
          )}
          {node.error && (
            <span className="text-[10px] text-red-500/80 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 ml-2 animate-in fade-in zoom-in-95 duration-300 whitespace-nowrap">
              {node.error}
            </span>
          )}
        </div>

        {isOpen && node.children && node.children.length > 0 && (
          <div className="flex flex-col w-full animate-in fade-in slide-in-from-top-1 duration-200">
            {(() => {
              const visibleLimit = node.visibleCount || 10;
              const visibleChildren = node.children.slice(0, visibleLimit);
              const hasMore = node.children.length > visibleLimit;

              return (
                <>
                  {visibleChildren.map((child: ExplorerNode) =>
                    renderNode(child, depth + 1),
                  )}
                  {hasMore &&
                    renderNode(
                      {
                        id: `load-more-${node.id}`,
                        name: `Show more (${node.children.length - visibleLimit} left)`,
                        type: "load-more",
                        hasChildren: false,
                        children: [],
                      },
                      depth + 1,
                    )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-500 rounded-full" />
          Explorer
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 pt-4 custom-scrollbar">
        <div className="flex flex-col gap-0.5">
          {treeData.map((node: ExplorerNode) => renderNode(node))}
        </div>
      </div>
    </div>
  );
}
