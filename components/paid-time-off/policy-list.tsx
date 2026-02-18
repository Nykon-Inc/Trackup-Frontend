import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { EditIcon, UsersIcon, CalendarIcon } from 'lucide-react'
import { Policy } from './policy-form'

interface PolicyListProps {
    policies: Policy[]
    onEdit: (policy: Policy) => void
    onToggleActive: (policy: Policy) => void
}
export function PolicyList({
    policies,
    onEdit,
    onToggleActive,
}: PolicyListProps) {
    if (policies.length === 0) {
        return (
            <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                    No policies yet
                </h3>
                <p className="text-muted-foreground">
                    Create your first policy to get started.
                </p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy) => (
                <Card key={policy.id} className="overflow-hidden">
                    <div className="h-1 w-full bg-linear-to-r from-green-500 to-emerald-400" />
                    <CardHeader className="px-4 pt-3 pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-foreground truncate leading-tight mb-1">
                                    {policy.name}
                                </h3>
                                <Badge
                                    variant={policy.enabled ? 'default' : 'secondary'}
                                    className={policy.enabled ? 'bg-green-500/15 text-green-700 border-green-200 hover:bg-green-500/20 text-xs px-1.5 py-0' : 'text-xs px-1.5 py-0'}
                                >
                                    {policy.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                                onClick={() => onEdit(policy)}
                                aria-label={`Edit ${policy.name}`}
                            >
                                <EditIcon className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="px-4 py-0">
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-muted-foreground">Days Allowed</span>
                                <span className="text-xl font-bold text-green-600">
                                    {policy.maxDaysPerYear}
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <span className="text-xs text-muted-foreground">Effective</span>
                                <span className="text-xs text-foreground">
                                    {new Date(policy.effectiveDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>

                            {policy.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
                                    {policy.description}
                                </p>
                            )}

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <UsersIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs">
                                    {policy.userCount} {policy.userCount === 1 ? 'employee' : 'employees'}
                                </span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="px-4 py-3 mt-2 border-t bg-muted/30">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-medium text-foreground">Enable Policy</span>
                            <Switch
                                checked={policy.enabled}
                                onCheckedChange={() => onToggleActive(policy)}
                                className="scale-90 data-[state=checked]:bg-green-500"
                            />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
