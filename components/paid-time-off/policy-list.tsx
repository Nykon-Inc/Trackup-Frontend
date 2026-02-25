import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { EditIcon, UsersIcon, CalendarIcon, ShieldIcon, ClockIcon } from 'lucide-react'
import { IPTOPolicy } from '@/interfaces/paid-time-offs.interfaces'
import TablePagination from '../ui/table-pagination'
import { ITablePagination } from '@/interfaces/common.interface'

interface PolicyListProps {
    policies: IPTOPolicy[]
    onEdit: (policy: IPTOPolicy) => void
    onToggleActive: (policy: IPTOPolicy) => void
    pagination: ITablePagination
}
export function PolicyList({
    policies,
    onEdit,
    onToggleActive,
    pagination
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
        <div className='space-y-4'>
            < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {policies.map((policy) => (
                    <Card
                        key={policy.id}
                        className="group hover:shadow-0 transition-all duration-200 border-slate-200/60 rounded-xl overflow-hidden p-0 gap-0"
                    >
                        <CardContent className="p-3.5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md shrink-0 bg-primary/5 text-primary">
                                        <ShieldIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 leading-none">
                                        {policy.name}
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mr-1 text-slate-400 hover:text-slate-600"
                                    onClick={() => onEdit(policy)}
                                    aria-label={`Edit ${policy.name}`}
                                >
                                    <EditIcon className="h-4 w-4" />
                                </Button>
                            </div>

                            <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 min-h-8 leading-relaxed">
                                {policy.description || "No description provided for this policy."}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <UsersIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="text-[11px] font-medium text-slate-400">
                                    {policy.projectIds.length} {policy.projectIds.length === 1 ? 'project' : 'projects'}
                                </span>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                        <CalendarIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{policy.maxDaysPerYear}d</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Days/Year</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                        <ClockIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date(policy.effectiveDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Effective</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${policy.enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    <span className="text-[11px] font-medium text-slate-400">
                                        {policy.enabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <Switch
                                    checked={policy.enabled}
                                    onCheckedChange={() => onToggleActive(policy)}
                                    className="scale-90 data-[state=checked]:bg-primary"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="border rounded-lg px-4 py-3 bg-white">
                <TablePagination
                    component="div"
                    count={pagination.totalResults}
                    page={pagination.page}
                    onPageChange={pagination.onPageChange}
                    rowsPerPage={pagination.rowsPerPage}
                    onRowsPerPageChange={pagination.onRowsPerPageChange}
                    rowsPerPageOptions={[8, 16, 24, 48]}
                    showFirstButton
                    showLastButton
                    className="border-0 p-0"
                />
            </div>

        </div>
    )
}