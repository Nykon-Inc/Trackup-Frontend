import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MEMBER_WIDGET_CONFIG } from '@/components/dashboard/member-widgets';
import { OWNER_WIDGET_CONFIG } from '@/components/dashboard/owner-widgets';

interface DashboardState {
    visibleMemberWidgets: string[];
    visibleOwnerWidgets: string[];
    setVisibleMemberWidgets: (ids: string[]) => void;
    setVisibleOwnerWidgets: (ids: string[]) => void;
    toggleMemberWidget: (id: string, isVisible: boolean) => void;
    toggleOwnerWidget: (id: string, isVisible: boolean) => void;
    resetDefaults: () => void;
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            visibleMemberWidgets: MEMBER_WIDGET_CONFIG.map((w) => w.id),
            visibleOwnerWidgets: OWNER_WIDGET_CONFIG.map((w) => w.id),
            setVisibleMemberWidgets: (ids) => set({ visibleMemberWidgets: ids }),
            setVisibleOwnerWidgets: (ids) => set({ visibleOwnerWidgets: ids }),
            toggleMemberWidget: (id, isVisible) =>
                set((state) => ({
                    visibleMemberWidgets: isVisible
                        ? [...state.visibleMemberWidgets, id]
                        : state.visibleMemberWidgets.filter((wId) => wId !== id),
                })),
            toggleOwnerWidget: (id, isVisible) =>
                set((state) => ({
                    visibleOwnerWidgets: isVisible
                        ? [...state.visibleOwnerWidgets, id]
                        : state.visibleOwnerWidgets.filter((wId) => wId !== id),
                })),
            resetDefaults: () =>
                set({
                    visibleMemberWidgets: MEMBER_WIDGET_CONFIG.map((w) => w.id),
                    visibleOwnerWidgets: OWNER_WIDGET_CONFIG.map((w) => w.id),
                }),
        }),
        {
            name: 'dashboard-widgets-storage',
            // Default behavior is localStorage, which is what we want
            // We can optionally use partialize to only persist visibleWidgets if needed, but defaults are fine.
        }
    )
);
