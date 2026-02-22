export interface ITimesheet {
    startDate: Date;
    endDate: Date;
    status: 'open' | 'approved' | 'rejected';
    submittedOn: Date;
    organizationId: string;

    userId: string;
    approvedBy?: string;
    approvedOn?: Date;
    rejectionReason?: string;
    paymentStatus?: 'paid' | 'notpaid';
    regularHours: number;
    manualTime: number;
    totalWorkedHours: number;
    activityLevel: number;
    screenshotCount: number;
    user?: string
}
