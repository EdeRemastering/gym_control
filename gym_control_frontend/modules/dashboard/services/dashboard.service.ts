import { api } from "@/lib/api/services";

export const dashboardService = {
  getOverview: async (token: string, gymId: string) => ({
    gyms: await api.gyms(token),
    revenue: await api.revenue(gymId, token),
  }),
};
