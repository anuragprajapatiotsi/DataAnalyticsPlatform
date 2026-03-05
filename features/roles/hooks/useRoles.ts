import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../services/role.service";
import { GetRolesParams, CreateRolePayload } from "../types";
import { message } from "antd";

export const useRoles = (params: GetRolesParams = { skip: 0, limit: 100 }) => {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["roles", params],
    queryFn: () => roleService.getRoles(params),
  });

  const createRoleMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => roleService.createRole(payload),
    onSuccess: () => {
      message.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to create role");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateRolePayload }) =>
      roleService.updateRole(id, payload),
    onSuccess: () => {
      message.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      message.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete role");
    },
  });

  return {
    data: rolesQuery.data?.data || [],
    total: rolesQuery.data?.total || 0,
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    createRole: createRoleMutation.mutateAsync,
    isCreating: createRoleMutation.isPending,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdating: updateRoleMutation.isPending,
    deleteRole: deleteRoleMutation.mutateAsync,
    isDeleting: deleteRoleMutation.isPending,
  };
};
