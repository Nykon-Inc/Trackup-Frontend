export interface SetupSessionPayload {
    organizationId: string;
}

export interface SetupSessionResponse {
    url: string;
}

export interface StripePaymentMethod {
    id: string;
    card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    };
    billing_details: {
        name: string;
        email: string;
    };
    isDefault: boolean;
}
