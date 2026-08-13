export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,001+"] as const;

export type DemoRequest = {
  workEmail: string;
  companySize: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  country: string;
  phone: string;
  marketingConsent: boolean;
  website?: string;
  formStartedAt?: number;
};

const limits: Record<keyof Omit<DemoRequest, "marketingConsent" | "formStartedAt">, number> = {
  workEmail: 254,
  companySize: 20,
  firstName: 80,
  lastName: 80,
  companyName: 160,
  jobTitle: 120,
  country: 100,
  phone: 40,
  website: 200,
};

export function validateDemoRequest(value: unknown): { data?: DemoRequest; error?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Invalid request." };
  }

  const input = value as Record<string, unknown>;
  const text = (key: keyof typeof limits) => {
    const field = input[key];
    return typeof field === "string" ? field.trim().slice(0, limits[key]) : "";
  };

  const data: DemoRequest = {
    workEmail: text("workEmail").toLowerCase(),
    companySize: text("companySize"),
    firstName: text("firstName"),
    lastName: text("lastName"),
    companyName: text("companyName"),
    jobTitle: text("jobTitle"),
    country: text("country"),
    phone: text("phone"),
    marketingConsent: input.marketingConsent === true,
    website: text("website"),
    formStartedAt: typeof input.formStartedAt === "number" ? input.formStartedAt : undefined,
  };

  if (data.website) return { error: "Unable to submit this request." };
  if (!/^\S+@\S+\.\S+$/.test(data.workEmail)) return { error: "Enter a valid work email address." };
  if (!COMPANY_SIZES.includes(data.companySize as (typeof COMPANY_SIZES)[number])) return { error: "Select a valid company size." };
  if (!data.firstName) return { error: "Enter your first name." };
  if (!data.lastName) return { error: "Enter your last name." };
  if (!data.companyName) return { error: "Enter your company name." };
  if (!data.jobTitle) return { error: "Enter your job title." };
  if (!data.country) return { error: "Enter your country or region." };
  if (!/^[+()\d\s.-]{7,40}$/.test(data.phone)) return { error: "Enter a valid phone number." };

  return { data };
}

export function safeSheetValue(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}
