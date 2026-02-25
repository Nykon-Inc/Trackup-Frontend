import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDisConnectHubstaff, useGetHubstaffAuthUrl, useGetMyOrganizations } from "@/services/organization.services";
import { ConnectedView } from "./connected-view";
import { UnconnectedView } from "./unconnected-view";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export function HubstaffIntegrationDialog({
    open,
    onOpenChange,
    orgId,
}: Props) {

    if (!orgId) return null;

    const { data: myOrganizations } = useGetMyOrganizations(); // no request cost , RQ uses cache
    const { mutate: getHubstaffAuthUrl, isPending: isGettingHubstaffAuthUrl } = useGetHubstaffAuthUrl();
    const { mutate: disConnectHubstaff, isPending: isDisConnectingHubstaff } = useDisConnectHubstaff(orgId);

    const isHubstaffConnectedForCurrentOrg = (myOrganizations || []).find((org) => org.organizationId === orgId)?.organization?.isHubstaffConnected || false;

    const handleConnect = () => {
        getHubstaffAuthUrl(orgId, {
            onSuccess({ url }) {
                window.open(url, "_blank");
                onOpenChange(false);
            }
        })
    };

    return (
        <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
            <DialogContent className="sm:max-w-120 p-0 gap-0 rounded-none border-neutral-200">
                <DialogHeader className="px-7 pt-7 pb-0">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-sans mb-0.5">
                            Integration
                        </p>
                        <DialogTitle className="text-xl font-bold text-black tracking-tight">
                            Hubstaff
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="h-px bg-gray-300 mt-6" />

                <div className="px-7 pb-6">
                    {
                        !isHubstaffConnectedForCurrentOrg
                            ? <UnconnectedView
                                loading={isGettingHubstaffAuthUrl}
                                onConnect={handleConnect}
                            />
                            : <ConnectedView
                                onClose={() => onOpenChange(false)}
                                onDisconnect={() => disConnectHubstaff()}
                                isDisconnecting={isDisConnectingHubstaff}
                            />
                    }
                </div>
            </DialogContent>
        </Dialog>
    );
}

