
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function OrganizationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WorkspaceProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    Carry on
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </WorkspaceProvider>
    );
}
