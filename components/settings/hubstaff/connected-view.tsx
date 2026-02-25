import { Button } from "@/components/ui/button";
import { Dot } from "lucide-react";

interface ConnectedViewProps {
    onClose: () => void;
    onDisconnect: () => void;
    isDisconnecting?: boolean;
}

export function ConnectedView({ onClose, onDisconnect, isDisconnecting }: ConnectedViewProps) {
    return (
        <div className="flex flex-col items-center text-center py-3">
            <div className="flex items-center gap-2">
                <Dot className="w-8 h-8 text-green-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-sans">
                    Active
                </span>
            </div>

            <h3 className="text-lg font-bold text-black tracking-tight mb-2">
                Hubstaff is connected
            </h3>
            <p className="text-sm text-neutral-500 font-sans leading-relaxed mb-6 max-w-xs">
                Your account is linked and syncing is active.
            </p>

            <div className="flex items-center gap-3">
                <Button
                    onClick={onDisconnect}
                    disabled={isDisconnecting}
                    variant="outline"
                    className="rounded-none px-8 h-10 text-xs uppercase tracking-widest font-sans border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
                <Button
                    onClick={onClose}
                    variant="outline"
                    className="rounded-none px-8 h-10 text-xs uppercase tracking-widest font-sans border-neutral-300 text-black hover:bg-neutral-50"
                >
                    Close
                </Button>
            </div>
        </div>
    );
}