import { useQuery } from "@tanstack/react-query";
import http from "@/services/base";
import { routes } from "@/services/routes";
import { IMemberDashboard, IOwnerDashboard } from "@/interfaces/dashboard.interfaces";

type DashboardRole = 'member' | 'owner' | 'manager';
type DashboardData = IMemberDashboard | IOwnerDashboard;

export const useGetDashboardOverview = (organizationId: string, role: DashboardRole) => {
    return useQuery({
        queryKey: ["dashboard-overview", organizationId, role],
        queryFn: async () => {
            const data = await http.get({
                url: routes.dashboard.overview(organizationId),
            });
            return data as DashboardData;
        },
        enabled: !!organizationId && !!role,
    });
};
