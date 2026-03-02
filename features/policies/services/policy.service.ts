import { api } from "@/shared/api/axios";
import { Policy, GetPoliciesParams } from "../types";

export const policyService = {
  async getPolicies(
    params: GetPoliciesParams = { skip: 0, limit: 50, name: "primary" },
  ) {
    const response = await api.get<Policy[]>("/policies", {
      params: {
        skip: params.skip,
        limit: params.limit,
        name: params.name || "primary",
      },
    });

    // The API returns an array directly based on user's description
    return {
      data: response.data,
      total: response.data.length, // Fallback if total isn't returned in headers
    };
  },

  async deletePolicy(id: string) {
    await api.delete(`/policies/${id}`);
  },
};
