"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useFetchInternalTimesheets } from "@/services/timesheets";
import { Badge } from "@/components/ui/badge";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { ITimesheet } from "@/interfaces/timesheet.interfaces";
import TablePagination from "@/components/ui/table-pagination";

// ✅ NEW IMPORTS
import { DateRange } from "react-day-picker";
import { subWeeks } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useSubmitTimesheet } from "@/services/timesheets";
import { SubmitTimesheetModal } from "../components/SubmitTimesheetModal";
import { toast } from "sonner";

export default function ViewEditTimesheetsPage() {
  const params = useParams();
  const { activeOrgId } = useWorkspace(); 

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Default date range = last 8 weeks
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subWeeks(today, 8),
    to: today,
  });

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<ITimesheet | null>(null);
  const queryClient = useQueryClient();
  const submitTimesheetMutation = useSubmitTimesheet();

  const handleSubmitClick = (row: ITimesheet) => {
    setSelectedTimesheet(row);
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (selectedTimesheet && "id" in selectedTimesheet) {
      try {
        await submitTimesheetMutation.mutateAsync((selectedTimesheet as any).id);
        queryClient.invalidateQueries({ queryKey: ["internal-timesheets"] });
        setSubmitModalOpen(false);
        setSelectedTimesheet(null);
        toast.success("Timesheet submitted successfully");
      } catch (error) {
        console.error("Failed to submit timesheet:", error);
        toast.error("Failed to submit timesheet. Please try again.");
      }
    }
  };

  // ✅ Pass date range to fetch hook
  const { data: timesheetsData, isLoading } = useFetchInternalTimesheets({
    search,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    page,
    limit: rowsPerPage,
    orgId : activeOrgId, 
  });

  const columns: TableColumn<ITimesheet>[] = [
    { header: "User", key: "user" },
    {
      header: "Pay Period",
      key: "startDate",
      render: (_, row) => {
        if (!row?.startDate || !row?.endDate) return "-";
        const formatDate = (date: Date | string) =>
          new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

        return `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`;
      },
    },
    {
      header: "Regular Hours",
      key: "regularHours",
    },
    {
      header: "Manual Time",
      key: "manualTime",
      render: (value) => {
        if (!value) return "";
        return <Badge variant="default">{value} hrs</Badge>;
      },
    },
    {
      header: "Total Worked Hours",
      key: "totalWorkedHours",
      render: (value) => (
        <Badge variant="default">{value} hrs</Badge>
      ),
    },
    {
      header: "Activity Level",
      key: "activityLevel",
      render: (value) => (
        <Badge variant="default">{value}%</Badge>
      ),
    },
    {
      header: "Submitted On",
      key: "submittedOn",
      render: (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
    {
      header: "Approved By",
      key: "approvedBy",
      render: (value) => value || "-",
    },
    {
      header: "Status",
      key: "status",
      render: (value) => <Badge>{value}</Badge>,
    },
    {
      header: "Screenshots",
      key: "screenshotCount",
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      ),
    },
    {
      header: "",
      key: "actions",
      width: "50px",
      render: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              View
            </DropdownMenuItem>
            {row.status === 'open' && (
              <DropdownMenuItem onClick={() => handleSubmitClick(row)}>
                Submit
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const response = timesheetsData as any;

  const timesheets = Array.isArray(timesheetsData)
    ? timesheetsData
    : response?.results || [];

  const totalResults = Array.isArray(timesheetsData)
    ? timesheets.length
    : response?.totalResults ?? timesheets.length;

  const totalPages = Array.isArray(timesheetsData)
    ? Math.max(1, Math.ceil(totalResults / rowsPerPage))
    : response?.totalPages ?? Math.max(1, Math.ceil(totalResults / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="flex flex-col h-full min-w-0">
      <PageHeader
        title="Timesheet Approvals"
        breadcrumbs={[
          {
            label: "Dashboard",
            href: `/dashboard/${params?.orgId}`,
            active: false,
          },
          {
            label: "Timesheets",
            href: `/dashboard/${params?.orgId}/timesheets`,
            active: false,
          },
          {
            label: "Approvals",
            href: `/dashboard/${params?.orgId}/timesheets/approvals`,
            active: true,
          },
        ]}
      />

      <div className="flex-1 min-w-0 flex flex-col p-4">
        {/* Search + Date (fixed within this panel) */}
        <div className="flex items-center justify-between flex-shrink-0">
          <DebouncedSearch
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search users..."
            wrapperClassName="max-w-sm"
          />

          <DatePickerWithRange
            date={dateRange}
            setDate={(range: any) => {
              setDateRange(range);
              setPage(1);
            }}
            className="w-[300px]"
          />
        </div>

        {/* Table: occupies remaining space and scrolls only inside its border */}
        <div className="flex-1 min-w-0 mt-4">
          <div className="h-full w-full overflow-hidden rounded-lg border bg-card">
            <div className="min-w-full h-full overflow-auto">
              <div className="min-w-full">
                <Table
                  data={timesheets}
                  columns={columns}
                  loading={isLoading}
                  emptyMessage="No timesheets found"
                />
              </div>
            </div>
          </div>

          <TablePagination
            count={totalResults}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            disabled={isLoading || totalPages <= 1}
          />
        </div>

      </div>

      <SubmitTimesheetModal
        open={submitModalOpen}
        onOpenChange={setSubmitModalOpen}
        selectedTimesheet={selectedTimesheet}
        isLoading={submitTimesheetMutation.isPending}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}