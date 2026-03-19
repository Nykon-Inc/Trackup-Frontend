"use client"

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { format, parseISO, isValid } from 'date-fns'
import { PageHeader } from '@/components/page-header'
import { CustomTabs } from '@/components/custom-tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Table, { TableColumn } from '@/components/ui/data-table'
import { ProjectsList } from '@/components/internal/projects/projects-list'
import {
    useGetInternalOrganization,
    useGetOrganizationMembers,
    useGetOrganizationInvitations,
    useUpdateOrganizationSubscription,
} from '@/services/organization.services'
import {
    Building2,
    Users,
    Crown,
    Calendar,
    Globe,
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    UserX,
    Briefcase,
    Mail,
    Zap,
    RefreshCw,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DatePickerCalendar } from '@/components/ui/date-picker-calendar'
import { addMonths } from 'date-fns'
import { OrganizationMember, OrganizationInvitation, OrganizationMemberRole } from '@/interfaces/organizations.interfaces'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
    label: string
    value: string | number
    icon: React.ElementType
    color: string
}) {
    return (
        <Card className="p-4 border-border shadow-sm bg-white rounded-xl gap-0">
            <CardContent className="p-0">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-neutral-900 leading-none">{value}</p>
            </CardContent>
        </Card>
    )
}

// ─── Skeleton loading ─────────────────────────────────────────────────────────
function StatCardSkeleton() {
    return (
        <Card className="p-4 border-border shadow-sm bg-white rounded-xl gap-0">
            <CardContent className="p-0">
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <Skeleton className="h-7 w-12" />
            </CardContent>
        </Card>
    )
}

// ─── Members Tab ──────────────────────────────────────────────────────────────
function MembersTab({ orgId }: { orgId: string }) {
    const { data: membersData, isLoading } = useGetOrganizationMembers({ organizationId: orgId, internal: true, query: { limit: 100 } })
    const { data: invitationsData, isLoading: invLoading } = useGetOrganizationInvitations({ organizationId: orgId, internal: true, query: { limit: 100 } })

    const members: OrganizationMember[] = (membersData as any)?.results || membersData || []
    const invitations: OrganizationInvitation[] = (invitationsData as any)?.results || invitationsData || []

    const memberColumns: TableColumn<OrganizationMember>[] = [
        {
            header: 'Member',
            key: 'user',
            render: (_, row) => (
                <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={row.user?.avatar || undefined} />
                        <AvatarFallback className="text-[9px] font-bold bg-neutral-100 text-neutral-600">
                            {(row.user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-neutral-800 leading-none">{row.user?.name || '—'}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{row.user?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            key: 'role',
            render: (val) => {
                const colors: Record<string, string> = {
                    owner: 'bg-amber-50 text-amber-700 border-amber-100',
                    manager: 'bg-blue-50 text-blue-700 border-blue-100',
                    member: 'bg-neutral-50 text-neutral-600 border-neutral-200',
                }
                return (
                    <Badge variant="outline" className={`capitalize text-[10px] font-bold rounded-full px-2 border ${colors[val] || colors.member}`}>
                        {val === 'owner' && <Crown className="h-2.5 w-2.5 mr-1" />}
                        {val}
                    </Badge>
                )
            },
            width: '110px'
        },
        {
            header: 'Status',
            key: 'status',
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    {val === 'active'
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : <XCircle className="h-3.5 w-3.5 text-neutral-300" />}
                    <span className={`text-[11px] font-semibold capitalize ${val === 'active' ? 'text-emerald-600' : 'text-neutral-400'}`}>{val}</span>
                </div>
            ),
            width: '100px'
        },
        {
            header: 'Hourly Rate',
            key: 'hourlyRate',
            render: (val) => (
                <span className="text-[11px] font-medium text-neutral-600">
                    {val ? `$${Number(val).toFixed(2)}/hr` : '—'}
                </span>
            ),
            width: '110px'
        },
        {
            header: 'Joined',
            key: 'createdAt',
            render: (val) => (
                <span className="text-[11px] text-neutral-400">
                    {val ? format(parseISO(val), 'MMM d, yyyy') : '—'}
                </span>
            ),
            width: '110px'
        },
    ]

    const invitationColumns: TableColumn<OrganizationInvitation>[] = [
        {
            header: 'Email',
            key: 'email',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-neutral-300" />
                    <span className="text-sm text-neutral-600">{val}</span>
                </div>
            )
        },
        {
            header: 'Role',
            key: 'role',
            render: (val) => (
                <Badge variant="outline" className="capitalize text-[10px] font-bold rounded-full px-2">
                    {val}
                </Badge>
            ),
            width: '110px'
        },
        {
            header: 'Status',
            key: 'status',
            render: (val) => {
                const colors: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-100',
                    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    expired: 'bg-neutral-50 text-neutral-400 border-neutral-200',
                }
                return (
                    <Badge variant="outline" className={`capitalize text-[10px] font-bold rounded-full px-2 border ${colors[val] || ''}`}>
                        {val}
                    </Badge>
                )
            },
            width: '100px'
        },
        {
            header: 'Expires',
            key: 'expiresAt',
            render: (val) => {
                const d = val ? new Date(val) : null
                return (
                    <span className="text-[11px] text-neutral-400">
                        {d && isValid(d) ? format(d, 'MMM d, yyyy') : '—'}
                    </span>
                )
            },
            width: '110px'
        },
    ]

    return (
        <div className="space-y-8">
            {/* Active Members */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-bold text-neutral-700">Active Members</h3>
                    <Badge variant="secondary" className="rounded-full text-[10px] font-bold">{members.length}</Badge>
                </div>
                <Table
                    columns={memberColumns}
                    data={members}
                    loading={isLoading}
                    emptyMessage="No members found."
                    className="border-none"
                />
            </div>

            {/* Pending Invitations */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-bold text-neutral-700">Pending Invitations</h3>
                    <Badge variant="secondary" className="rounded-full text-[10px] font-bold">{invitations.length}</Badge>
                </div>
                <Table
                    columns={invitationColumns}
                    data={invitations}
                    loading={invLoading}
                    emptyMessage="No pending invitations."
                    className="border-none"
                />
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrganizationDetailPage() {
    const params = useParams()
    const orgId = params.orgId as string
    const [tab, setTab] = useState('overview')

    const { data: org, isLoading: orgLoading } = useGetInternalOrganization(orgId)
    const { data: membersData, isLoading: membersLoading } = useGetOrganizationMembers({
        organizationId: orgId,
        internal: true,
        query: { limit: 100 }
    })

    const members: OrganizationMember[] = (membersData as any)?.results || membersData || []

    const owner = members.find(m => m.role === OrganizationMemberRole.OWNER)
    const managers = members.filter(m => m.role === OrganizationMemberRole.MANAGER)
    const regularMembers = members.filter(m => m.role === OrganizationMemberRole.MEMBER)

    // subscription — read directly from Organization interface fields
    const subStatus: string = org?.subscriptionStatus || 'trialing'
    const isActive = subStatus === 'active'
    const subColors: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        trialing: 'bg-blue-50 text-blue-700 border-blue-100',
        past_due: 'bg-red-50 text-red-700 border-red-100',
        canceled: 'bg-neutral-50 text-neutral-500 border-neutral-200',
        unpaid: 'bg-orange-50 text-orange-600 border-orange-100',
    }

    // subscription update
    const { mutate: updateSubscription, isPending: isUpdatingSub } = useUpdateOrganizationSubscription()
    const [subModalOpen, setSubModalOpen] = useState(false)
    // default new period end: +1 month from today or from current end
    const defaultEnd: Date = org?.currentPeriodEnd
        ? addMonths(parseISO(org.currentPeriodEnd), 1)
        : addMonths(new Date(), 1)
    const [newPeriodEnd, setNewPeriodEnd] = useState<Date | undefined>(defaultEnd)

    const handleUpdateSubscription = () => {
        if (!newPeriodEnd) return
        updateSubscription(
            { organizationId: orgId, currentPeriodEnd: newPeriodEnd.toISOString() },
            { onSuccess: () => setSubModalOpen(false) }
        )
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#FAFAFA]">
            <PageHeader
                title={orgLoading ? 'Loading...' : (org?.name || 'Organization')}
                breadcrumbs={[
                    { label: 'Internal', href: '/internal', active: false },
                    { label: 'Organizations', href: '/internal/organizations', active: false },
                    { label: org?.name || orgId, active: true },
                ]}
            />

            <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <CustomTabs
                        tabs={[
                            { value: 'overview', label: 'Overview' },
                            { value: 'projects', label: 'Projects' },
                            { value: 'members', label: 'Members' },
                        ]}
                        value={tab}
                        persistInRoute={true}
                        onChange={setTab}
                    />
                </div>

                {/* ── Overview Tab ─────────────────────────────────── */}
                {tab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {orgLoading || membersLoading ? (
                                <>
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </>
                            ) : (
                                <>
                                    <StatCard
                                        label="Total Members"
                                        value={members.length}
                                        icon={Users}
                                        color="bg-blue-50 text-blue-600"
                                    />
                                    <StatCard
                                        label="Managers"
                                        value={managers.length}
                                        icon={Briefcase}
                                        color="bg-violet-50 text-violet-600"
                                    />
                                    <StatCard
                                        label="Regular Members"
                                        value={regularMembers.length}
                                        icon={UserCheck}
                                        color="bg-emerald-50 text-emerald-600"
                                    />
                                    <StatCard
                                        label="Status"
                                        value={org?.status === 'active' ? 'Active' : 'Disabled'}
                                        icon={org?.status === 'active' ? CheckCircle2 : UserX}
                                        color={org?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}
                                    />
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Organization Info */}
                            <Card className="p-5 border-border shadow-sm bg-white rounded-xl gap-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Organization Details</h3>
                                <CardContent className="p-0 space-y-3">
                                    {orgLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5 w-full" />)}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                                    <Building2 className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Name</p>
                                                    <p className="text-sm font-semibold text-neutral-800">{org?.name || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                                    <Globe className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Domain</p>
                                                    <p className="text-sm font-semibold text-neutral-800">{org?.domain || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Created</p>
                                                    <p className="text-sm font-semibold text-neutral-800">
                                                        {org?.createdAt ? format(parseISO(org.createdAt), 'MMMM d, yyyy') : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                                    <Shield className="h-4 w-4 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hubstaff</p>
                                                    <p className="text-sm font-semibold text-neutral-800">
                                                        {org?.isHubstaffConnected ? 'Connected' : 'Not Connected'}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Owner + Subscription */}
                            <div className="space-y-4">
                                {/* Owner Card */}
                                <Card className="p-5 border-border shadow-sm bg-white rounded-xl gap-1">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">Owner</h3>
                                    <CardContent className="p-0">
                                        {membersLoading ? (
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-44" />
                                                </div>
                                            </div>
                                        ) : owner ? (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarImage src={owner.user?.avatar || undefined} />
                                                    <AvatarFallback className="text-xs font-bold bg-amber-50 text-amber-700">
                                                        {(owner.user?.name || 'O').split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-neutral-800">{owner.user?.name}</p>
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 rounded-full text-[9px] font-bold px-1.5">
                                                            <Crown className="h-2 w-2 mr-0.5" /> Owner
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-neutral-400 mt-0.5">{owner.user?.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-neutral-400 italic">No owner found</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Subscription Card */}
                                <Card className="p-5 border-border shadow-sm bg-white rounded-xl gap-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Subscription</h3>
                                        {!orgLoading && (
                                            <Button
                                                size="sm"
                                                variant={isActive ? 'outline' : 'default'}
                                                className={`h-7 text-[11px] font-bold gap-1.5 rounded-lg ${isActive
                                                        ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                                onClick={() => {
                                                    setNewPeriodEnd(defaultEnd)
                                                    setSubModalOpen(true)
                                                }}
                                            >
                                                {isActive
                                                    ? <><RefreshCw className="h-3 w-3" /> Extend</>
                                                    : <><Zap className="h-3 w-3" /> Activate</>}
                                            </Button>
                                        )}
                                    </div>
                                    <CardContent className="p-0">
                                        {orgLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-3 w-36" />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`capitalize text-[10px] font-bold rounded-full px-2 border ${subColors[subStatus] || subColors.trialing}`}>
                                                        {subStatus.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-neutral-400">$12 / seat / month</span>
                                                </div>
                                                {org?.currentPeriodEnd && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Period ends: {format(parseISO(org.currentPeriodEnd), 'MMMM d, yyyy')}
                                                    </div>
                                                )}
                                                {org?.trialEndsAt && (
                                                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Trial ends: {format(parseISO(org.trialEndsAt), 'MMMM d, yyyy')}
                                                    </div>
                                                )}
                                                {!org?.subscriptionStatus && (
                                                    <p className="text-xs text-neutral-400 italic">No subscription data yet</p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Projects Tab ──────────────────────────────────── */}
                {tab === 'projects' && (
                    <ProjectsList
                        organizationId={orgId}
                        basePath={`/internal/organizations/${orgId}/projects`}
                    />
                )}

                {/* ── Members Tab ───────────────────────────────────── */}
                {tab === 'members' && (
                    <MembersTab orgId={orgId} />
                )}
            </div>

            {/* ── Subscription Modal ──────────────────────────────── */}
            <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">
                            {isActive ? 'Extend Subscription' : 'Activate Subscription'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-neutral-500">
                            {isActive
                                ? 'Set a new period end date to extend this organization\'s subscription.'
                                : 'Set a subscription end date to activate access for this organization. Plan: $12/seat/month.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">New Period End Date</Label>
                            <DatePickerCalendar
                                selected={newPeriodEnd}
                                onSelect={setNewPeriodEnd}
                                placeholder="Select end date"
                                minDate={new Date()}
                                classname="w-full h-10 rounded-lg text-sm"
                            />
                        </div>

                        <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-xs text-neutral-500 space-y-1">
                            <p><span className="font-semibold text-neutral-700">Plan:</span> Standard — $12 per seat / month</p>
                            <p><span className="font-semibold text-neutral-700">Seats:</span> {members.length} member{members.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setSubModalOpen(false)} className="font-bold">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateSubscription}
                            disabled={!newPeriodEnd || isUpdatingSub}
                            className={isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                        >
                            {isUpdatingSub
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : isActive ? 'Extend Subscription' : 'Activate Subscription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
