"use client"

import React from "react"
import Table, { TableColumn } from "@/components/ui/data-table"
import { IWorkBreakPolicy } from "@/interfaces/work-break.interfaces"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WorkBreakTableProps {
    data: IWorkBreakPolicy[]
    isLoading: boolean
    onEdit: (policy: IWorkBreakPolicy) => void
    onDelete: (policyId: string) => void
    onToggleEnabled: (policyId: string, enabled: boolean) => void
}

export default function WorkBreakTable({
    data,
    isLoading,
    onEdit,
    onDelete,
    onToggleEnabled
}: WorkBreakTableProps) {
    const columns: TableColumn<IWorkBreakPolicy>[] = [
        {
            header: "Name",
            key: "name",
            sortable: true,
            render: (value, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{value}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">{row.description}</span>
                </div>
            )
        },
        {
            header: "Duration",
            key: "duration",
            sortable: true,
            render: (value) => (
                <span className="font-mono text-xs">{value} mins</span>
            )
        },
        {
            header: "Type",
            key: "paid",
            render: (value, row) => (
                <Badge variant={row.paid ? "default" : "secondary"} className="capitalize">
                    {row.paid ? "Paid" : "Unpaid"}
                </Badge>
            )
        },
        {
            header: "Projects",
            key: "projectIds",
            render: (value: string[]) => (
                <Badge variant="outline" className="font-normal">
                    {value?.length || 0} Projects
                </Badge>
            )
        },
        {
            header: "Status",
            key: "enabled",
            render: (value, row) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        checked={value}
                        onCheckedChange={(checked) => onToggleEnabled(row.id, checked)}
                    />
                    <span className="text-xs text-slate-500">{value ? "Enabled" : "Disabled"}</span>
                </div>
            )
        },
        {
            header: "",
            key: "actions",
            align: "right",
            render: (_, row) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Policy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete(row.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Policy
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    return (
        <Table
            data={data}
            columns={columns}
            loading={isLoading}
            emptyMessage="No work break policies found. Create one to get started."
            rowKey={(row) => row.id}
            bordered
            hover
        />
    )
}
