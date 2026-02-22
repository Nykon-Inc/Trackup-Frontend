import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle } from "lucide-react";

interface IdleViewProps {
    loading: boolean;
    onConnect: () => void;
}
const features = [
    "Sync employee time logs automatically",
    "Import project & task data in real-time",
    "Monitor productivity across your team",
];

export function UnconnectedView({ loading, onConnect }: IdleViewProps) {
    return (
        <>
            <p className="text-sm text-neutral-500 leading-relaxed font-sans mb-6">
                Connect your Hubstaff account to sync time tracking, projects, and team
                productivity data directly into your workspace.
            </p>

            <ul className="flex flex-col gap-3 mb-7">
                {features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                        <CheckCircle className="w-3.5 h-3.5 text-black shrink-0" />
                        <span className="text-[13px] text-neutral-700 font-sans">{f}</span>
                    </li>
                ))}
            </ul>

            <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 mb-6">
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    You'll be redirected to Hubstaff to authorize access. We only request
                    read permissions for time and project data.
                </p>
            </div>

            <Button
                onClick={onConnect}
                disabled={loading}
                className={cn(
                    "w-full rounded-none h-11 text-xs uppercase tracking-widest font-sans",
                    "bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-700"
                )}
            >
                {
                    loading
                        ?
                        " Connecting..."
                        : (
                            <>
                                Connect with Hubstaff
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )
                }
            </Button>
        </>
    );
}

