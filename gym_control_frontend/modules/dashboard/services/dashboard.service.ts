import { api } from "@/lib/api/services";

export const dashboardService = {
  getOverview: async () => ({
    gyms: await api.gyms(),
    revenue: await api.revenue(),
  }),
};
