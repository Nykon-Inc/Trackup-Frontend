import { CalendarIcon } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { IPTOPolicy } from "@/interfaces/paid-time-offs.interfaces"


export const PolicyOverview = ({ policies }: { policies: IPTOPolicy[] }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {policies.map((policy) => (
                <Card key={policy.id} className="overflow-hidden">
                    <div className="h-1 w-full bg-linear-to-r from-green-500 to-emerald-400" />
                    <CardContent className="px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-green-500/10 rounded-md shrink-0">
                                <CalendarIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-black truncate">{policy.name}</p>
                                <p className="text-xl font-bold text-foreground leading-tight">
                                    10
                                    <span className="text-xs text-muted-foreground font-normal">
                                        /{policy.maxDaysPerYear} days
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}