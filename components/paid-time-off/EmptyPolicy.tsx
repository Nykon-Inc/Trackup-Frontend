import { Filter } from "lucide-react";
import { Button } from "../ui/button";

export const EmptyPolicy = ({ clearFilters }: { clearFilters: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-50 p-3 rounded-full mb-3">
                <Filter className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No policies found</h3>
            <p className="text-slate-500 text-xs max-w-xs mt-1">
                We couldn't find any policies matching your current filters or search query.
            </p>
            <Button
                variant="outline"
                size="sm"
                className="mt-4 h-8 text-xs"
                onClick={clearFilters}
            >
                Clear all filters
            </Button>
        </div>
    )
}