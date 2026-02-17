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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
                <Card key={policy.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {policy.name}
                                </h3>
                                <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                                    {policy.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <Button
                                variant="secondary"
                                className="p-2"
                                onClick={() => onEdit(policy)}
                                aria-label={`Edit ${policy.name}`}
                            >
                                <EditIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Days Allowed</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {policy.maxDaysPerYear}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Effective Date</p>
                                <p className="text-sm text-foreground">
                                    {new Date(policy.effectiveDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {policy.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm text-foreground">
                                        {policy.description}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {policy.userCount}{' '}
                                    {policy.userCount === 1 ? 'employee' : 'employees'}
                                </span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium text-foreground">
                                Enable Policy
                            </span>
                            <Switch
                                checked={policy.enabled}
                                onCheckedChange={() => onToggleActive(policy)}
                            />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
