export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export interface IPaymentBatch {
    id: string;
    organizationId: string;
    timesheetIds: string[];
    paymentIds: string[];
    totalTimesheets: number;
    processedCount: number;
    failedCount: number;
    initiatedBy: {
        id: string;
        name?: string;
        email?: string;
        avatar?: string;
        accountType?: string;
        status?: string;
    } | null;
    status: string;
    totalAmount: number;
    currency: string;
    notes: string | null;
    processedAt: string | null;
    createdOn: string;
    createdAt: string;
    updatedAt: string;
}

export interface IProjectBreakdown {
    projectId: string;
    projectName: string;
    hours: number;
    amount: number;
}

export interface IPaymentItem {
    userId: string;
    timesheetId: string;
    timesheetStartDate: Date;
    timesheetEndDate: Date;
    totalLoggedHours: number;
    totalHolidayHours: number;
    totalPtoHours: number;
    projectBreakdowns: IProjectBreakdown[];
    totalAmount: number;
    currency: string;
}

export interface IProcessPaymentBody {
    organizationId: string;
    timesheetId: string;
    paymentItems: IPaymentItem;
    totalAmount: number;
    currency?: string;
    notes?: string;
}

export interface ICreateBatchBody {
    organizationId: string;
    timesheetIds: string[];
}

export interface IPaymentRecord {
    _id?: string;
    timesheetId: string;
    userId: string;
    userName: string | null;
    userAvatar: string | null;
    organizationId: string;
    startDate: string;
    endDate: string;
    status: string;
    paymentStatus: "paid" | "notpaid" | null;
    approvedBy: string | null;
    approvedOn: string | null;
    totalLoggedHours: number;
    totalHolidayHours: number;
    totalPtoHours: number;
    projectBreakdowns: IProjectBreakdown[];
    totalAmount: number;
    currency: string;
}
