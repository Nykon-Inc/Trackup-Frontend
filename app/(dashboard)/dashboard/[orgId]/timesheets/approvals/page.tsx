"use client";

import React, { useState } from "react";
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

// ✅ NEW IMPORTS
import { DateRange } from "react-day-picker";
import { subWeeks } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

export default function ViewEditTimesheetsPage() {
  const params = useParams();

  const [search, setSearch] = useState("");

  // ✅ Default date range = last 8 weeks
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subWeeks(today, 8),
    to: today,
  });

  // ✅ Pass date range to fetch hook
  const { data: timesheetsData, isLoading } = useFetchInternalTimesheets({
    search,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
  });

  const columns: TableColumn<ITimesheet>[] = [
    { header: "Member", key: "Member" },
    { header: "Pay Period", key: "payPeriod" },
    {
      header: "Regular Hours",
      key: "regularHours",
    },
    {
      header: "Manual Time",
      key: "manualTime",
      render: (value) => (
        <Badge variant="default">{value} hrs</Badge>
      ),
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
      render: (value) =>
        new Date(value).toLocaleDateString() +
        " " +
        new Date(value).toLocaleTimeString(),
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
            <DropdownMenuItem onClick={() => {}}>
              Submit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const timesheets = Array.isArray(timesheetsData)
    ? timesheetsData
    : (timesheetsData as any)?.results || [];

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
            onSearch={(val) => setSearch(val)}
            placeholder="Search users..."
            wrapperClassName="max-w-sm"
          />

          <DatePickerWithRange
            date={dateRange}
            setDate={(range: any) => setDateRange(range)}
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
        </div>

      </div>
    </div>
  );
}