export type PaymentStatus = "pending" | "processing" | "completed" | "failed";

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
