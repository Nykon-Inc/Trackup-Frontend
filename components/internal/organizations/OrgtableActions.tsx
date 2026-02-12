import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Organization } from '@/interfaces/organizations.interfaces';
import { MoreVertical, FolderOpen, LogIn, Mail, Laptop, Ban, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'
import { useDisableOrganization, useEnableOrganization, useResendOrganizationInvite } from '@/services/organization.services';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface OrgtableActionsProps {
    org: Organization;
}

export default function OrgtableActions({ org }: OrgtableActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const disableMutation = useDisableOrganization();
    const enableMutation = useEnableOrganization();
    const resendInviteMutation = useResendOrganizationInvite();

    const impersonate = (id: string) => {
        // Implement impersonate logic
        toast.info("Impersonation feature coming soon");
    }

    const resendInvite = (id: string) => {
        toast.promise(resendInviteMutation.mutateAsync(id), {
            loading: 'Resending invite...',
            success: 'Organization invite resent successfully',
            error: (err: any) => err?.response?.data?.message || "Failed to resend invite",
        });
    }

    const suspendOrg = (id: string) => {
        toast.promise(
            disableMutation.mutateAsync(id).then(() => {
                queryClient.invalidateQueries({ queryKey: ["internal-organizations"] });
            }),
            {
                loading: 'Suspending organization...',
                success: 'Organization suspended successfully',
                error: (err: any) => err?.response?.data?.message || "Failed to suspend organization",
            }
        );
    }

    const reactivateOrg = (id: string) => {
        toast.promise(
            enableMutation.mutateAsync(id).then(() => {
                queryClient.invalidateQueries({ queryKey: ["internal-organizations"] });
            }),
            {
                loading: 'Reactivating organization...',
                success: 'Organization reactivated successfully',
                error: (err: any) => err?.response?.data?.message || "Failed to reactivate organization",
            }
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

                <DropdownMenuItem
                    className="text-xs"
                    onClick={() =>
                        router.push(`/internal/organizations/${org.id}/projects`)
                    }
                >
                    <FolderOpen className="mr-2 h-3.5 w-3.5" />
                    View Projects
                </DropdownMenuItem>

                <DropdownMenuItem className="text-xs" onClick={() => impersonate(org.id)}>
                    <LogIn className="mr-2 h-3.5 w-3.5" />
                    Login as Owner
                </DropdownMenuItem>

                <DropdownMenuItem className="text-xs" onClick={() => resendInvite(org.id)}>
                    <Mail className="mr-2 h-3.5 w-3.5" />
                    Resend Owner Invite
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {org.status === "active" ? (
                    <DropdownMenuItem
                        className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => suspendOrg(org.id)}
                    >
                        <Ban className="mr-2 h-3.5 w-3.5 text-red-600" />
                        Suspend Organization
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        className="text-xs"
                        onClick={() => reactivateOrg(org.id)}
                    >
                        <CheckCircle className="mr-2 h-3.5 w-3.5" />
                        Reactivate Organization
                    </DropdownMenuItem>
                )}

            </DropdownMenuContent>
        </DropdownMenu>

    )
}
