import { Filter } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { PTOPOLICY_STATUS } from "@/interfaces/paid-time-offs.interfaces"

type Props = {
    search: string
    statusFilter: string
    setSearch: React.Dispatch<React.SetStateAction<string>>
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>
    toggleStatusFilter: (status: string) => void
}
export const PTOPoliciesFilter: React.FC<Props> = ({ search, statusFilter, setSearch, setStatusFilter, toggleStatusFilter }) => {
    return (
        <div className="flex items-center gap-2">
            <Input
                placeholder="Search policies by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-60 h-8 text-xs"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Status</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-45">
                    <DropdownMenuLabel className="text-xs">Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.values(PTOPOLICY_STATUS).map((status) => (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={statusFilter === status}
                            onCheckedChange={() => toggleStatusFilter(status)}
                            className="text-xs"
                        >
                            {status}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}